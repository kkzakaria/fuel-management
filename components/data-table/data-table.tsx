"use client"

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { useEffect, useState, useMemo, useRef } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { DataTableProps } from "@/types/data-table"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"

/**
 * Composant de tableau de données réutilisable avec TanStack Table
 *
 * Fonctionnalités :
 * - Tri sur colonnes
 * - Filtrage et recherche
 * - Pagination
 * - Sélection multiple
 * - Visibilité des colonnes
 * - État de chargement avec skeleton
 * - Navigation sur clic de ligne
 * - Actions personnalisables
 *
 * @example
 * ```tsx
 * const columns: ColumnDef<MyData>[] = [
 *   {
 *     accessorKey: "name",
 *     header: ({ column }) => (
 *       <DataTableColumnHeader column={column} title="Nom" />
 *     ),
 *   },
 * ]
 *
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   isLoading={isLoading}
 *   searchKey="name"
 *   searchPlaceholder="Rechercher par nom..."
 *   filterColumns={[{ key: "status", label: "Statut" }]}
 *   onRowClick={(row) => router.push(`/details/${row.id}`)}
 *   enableSelection // Pour usage futur - sélection multiple avec checkboxes
 *   actions={(table) => (
 *     <Button onClick={() => exportData(table.getSelectedRowModel().rows)}>
 *       Exporter
 *     </Button>
 *   )}
 * />
 * ```
 */
export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  searchKey,
  searchPlaceholder,
  filterColumns,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  onRowClick,
  enableSelection: _enableSelection = false, // Réservé pour usage futur - sélection multiple
  enableColumnVisibility = true,
  stickyHeader = false,
  actions,
  addButton,
  onSelectionChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  // Ref pour tracker le premier montage
  const isFirstMount = useRef(true)

  // Stabiliser les données avec useMemo pour éviter les re-renders inutiles
  const stableData = useMemo(() => data, [data])
  const stableColumns = useMemo(() => columns, [columns])

  // Réinitialiser la pagination quand les données changent (APRÈS le premier montage)
  useEffect(() => {
    // Ignorer le premier montage pour éviter l'erreur "state update before mount"
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }))
  }, [stableData])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: stableData,
    columns: stableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Callback pour les lignes sélectionnées
  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original)
      onSelectionChange(selectedRows)
    }
  }, [rowSelection, onSelectionChange, table])

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <DataTableToolbar
        table={table}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        filterColumns={filterColumns}
        enableColumnVisibility={enableColumnVisibility}
        actions={actions?.(table)}
        addButton={addButton}
      />

      {/* Tableau */}
      <div
        className={cn(
          "rounded-md border bg-background",
          stickyHeader ? "overflow-y-auto max-h-[600px]" : "overflow-hidden"
        )}
      >
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className={cn(
                        "h-11 font-bold",
                        stickyHeader &&
                          "sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // État de chargement - lignes skeleton
              Array.from({ length: pageSize }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {table.getAllColumns().map((column, colIndex) => {
                    if (!column.getIsVisible()) return null

                    // Largeurs variées pour effet naturel
                    const widths = [75, 80, 85, 70, 90, 65, 95, 88]
                    const width = widths[colIndex % widths.length]

                    return (
                      <TableCell key={column.id}>
                        {column.id === "select" ? (
                          <Skeleton className="h-4 w-4" />
                        ) : column.id === "actions" ? (
                          <Skeleton className="h-8 w-8 rounded-md" />
                        ) : (
                          <Skeleton
                            className="h-4"
                            style={{ width: `${width}%` }}
                          />
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              // Données normales
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.id === "actions" && "last:py-0"
                      )}
                      onClick={(e) => {
                        // Empêcher la navigation si on clique sur la checkbox ou les actions
                        if (
                          cell.column.id === "select" ||
                          cell.column.id === "actions"
                        ) {
                          e.stopPropagation()
                        }
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Aucun résultat
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
    </div>
  )
}
