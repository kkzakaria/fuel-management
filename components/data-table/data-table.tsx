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
import { useEffect, useState } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { DataTableProps } from "@/types/data-table"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableSkeleton } from "./data-table-skeleton"
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
 *   enableSelection
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
  enableSelection = false,
  enableColumnVisibility = true,
  actions,
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

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
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

  // Afficher le skeleton si en cours de chargement
  if (isLoading) {
    return (
      <DataTableSkeleton
        columnCount={columns.length}
        rowCount={pageSize}
        showSelection={enableSelection}
        showActions={columns.some((col) => col.id === "actions")}
      />
    )
  }

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
      />

      {/* Tableau */}
      <div className="overflow-hidden rounded-md border bg-background">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className="h-11"
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
            {table.getRowModel().rows?.length ? (
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
