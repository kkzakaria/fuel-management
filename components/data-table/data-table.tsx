"use client"

import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import type { DataTableProps } from "@/types/data-table"

/**
 * Composant de tableau de données réutilisable avec TanStack Table
 *
 * Fonctionnalités :
 * - Tri sur colonnes
 * - Filtrage et recherche
 * - Pagination (client ou serveur)
 * - Sélection multiple
 * - Visibilité des colonnes
 * - État de chargement avec skeleton
 * - Navigation sur clic de ligne
 * - Support URL state (nuqs)
 * - Import/Export CSV et Excel
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50],
  enablePagination = true,
  enableRowSelection = false,
  enableSorting = true,
  isLoading = false,
  emptyMessage,
  getRowId,
  onRowClick,
  stickyHeader = false,
  onRowSelectionChange,
  manualPagination = false,
  pageCount,
  // État initial depuis l'URL
  initialColumnFilters = [],
  initialSorting = [],
  initialColumnVisibility = {},
  initialPagination,
  // Callbacks pour les changements d'état
  onColumnFiltersChange,
  onSortingChange,
  onColumnVisibilityChange,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  // Track si le composant est monté pour éviter les mises à jour d'état pendant le render
  const isMountedRef = React.useRef(false)
  React.useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // État local initialisé avec les valeurs URL
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility)
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(initialColumnFilters)
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [pagination, setPagination] = React.useState(
    initialPagination || {
      pageIndex: 0,
      pageSize,
    }
  )

  // Wrappers pour les setters qui mettent à jour l'état local uniquement après le montage
  const handleColumnFiltersChange = React.useCallback(
    (
      updater:
        | ColumnFiltersState
        | ((prev: ColumnFiltersState) => ColumnFiltersState)
    ) => {
      if (isMountedRef.current) {
        setColumnFilters(updater)
      }
    },
    []
  )

  const handleSortingChange = React.useCallback(
    (updater: SortingState | ((prev: SortingState) => SortingState)) => {
      if (isMountedRef.current) {
        setSorting(updater)
      }
    },
    []
  )

  const handleColumnVisibilityChange = React.useCallback(
    (
      updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)
    ) => {
      if (isMountedRef.current) {
        setColumnVisibility(updater)
      }
    },
    []
  )

  const handlePaginationChange = React.useCallback(
    (
      updater:
        | { pageIndex: number; pageSize: number }
        | ((prev: {
            pageIndex: number
            pageSize: number
          }) => { pageIndex: number; pageSize: number })
    ) => {
      if (isMountedRef.current) {
        setPagination(updater)
      }
    },
    []
  )

  // Sync avec les callbacks URL après les changements d'état
  React.useEffect(() => {
    if (isMountedRef.current && onColumnFiltersChange) {
      onColumnFiltersChange(columnFilters)
    }
  }, [columnFilters, onColumnFiltersChange])

  React.useEffect(() => {
    if (isMountedRef.current && onSortingChange) {
      onSortingChange(sorting)
    }
  }, [sorting, onSortingChange])

  React.useEffect(() => {
    if (isMountedRef.current && onColumnVisibilityChange) {
      onColumnVisibilityChange(columnVisibility)
    }
  }, [columnVisibility, onColumnVisibilityChange])

  React.useEffect(() => {
    if (isMountedRef.current && onPaginationChange) {
      onPaginationChange(pagination)
    }
  }, [pagination, onPaginationChange])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    // Définir pageCount uniquement pour la pagination manuelle
    pageCount: manualPagination ? (pageCount ?? -1) : undefined,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId,
    manualPagination,
  })

  // Tracker la pagination précédente pour détecter les vrais changements
  const prevPaginationRef = React.useRef(pagination)

  // Notifier le parent des changements de sélection
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original)
      onRowSelectionChange(selectedRows)
    }
  }, [rowSelection, onRowSelectionChange, table])

  // Notifier le parent des changements de pagination (pour la pagination serveur)
  React.useEffect(() => {
    const prevPagination = prevPaginationRef.current
    const hasChanged =
      prevPagination.pageIndex !== pagination.pageIndex ||
      prevPagination.pageSize !== pagination.pageSize

    if (hasChanged && manualPagination && onPaginationChange) {
      onPaginationChange(pagination)
      prevPaginationRef.current = pagination
    }
  }, [pagination, manualPagination, onPaginationChange])

  return (
    <div className="flex flex-col h-full space-y-4">
      {toolbar && <DataTableToolbar table={table} config={toolbar} />}
      <div className="rounded-md border flex-1 min-h-0">
        <div
          className={cn(
            "relative h-full overflow-auto",
            stickyHeader && "max-h-[600px]"
          )}
        >
          <table className="w-full caption-bottom text-sm">
            <thead
              className={cn(
                "[&_tr]:border-b",
                stickyHeader && "sticky top-0 z-10 bg-card shadow-sm"
              )}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className={cn(
                    "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
                    "bg-card hover:bg-card border-b-2"
                  )}
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className={cn(
                          "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
                          "!font-bold"
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody className={cn("[&_tr:last-child]:border-0")}>
              {isLoading ? (
                // État de chargement - lignes skeleton
                Array.from({ length: pageSize }).map((_, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={cn(
                      "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                    )}
                  >
                    {table.getAllColumns().map((column, colIndex) => {
                      if (!column.getIsVisible()) return null

                      const widths = [75, 80, 85, 70, 90, 65, 95, 88]
                      const width = widths[colIndex % widths.length]

                      return (
                        <td
                          key={column.id}
                          className={cn(
                            "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                          )}
                        >
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
                        </td>
                      )
                    })}
                  </tr>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                        )}
                        onClick={(e) => {
                          // Empêcher la navigation sur les colonnes select et actions
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
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr
                  className={cn(
                    "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                  )}
                >
                  <td
                    colSpan={columns.length}
                    className={cn(
                      "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
                      "h-24 text-center"
                    )}
                  >
                    {emptyMessage ?? "Aucun résultat."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {enablePagination && (
        <div className="flex-shrink-0">
          <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
        </div>
      )}
    </div>
  )
}
