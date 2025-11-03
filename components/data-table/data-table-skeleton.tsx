import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTableSkeletonProps } from "@/types/data-table"

/**
 * Composant skeleton pour l'état de chargement du DataTable
 *
 * @example
 * <DataTableSkeleton columnCount={5} rowCount={10} showSelection />
 */
export function DataTableSkeleton({
  columnCount = 5,
  rowCount = 10,
  showSelection = false,
  showActions = false,
}: DataTableSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          {/* Barre de recherche */}
          <Skeleton className="h-10 w-full max-w-xs" />
          {/* Filtres */}
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-md border bg-background">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {/* Colonne de sélection */}
              {showSelection && (
                <TableHead style={{ width: "40px" }} className="h-11">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
              )}

              {/* Colonnes de données */}
              {Array.from({ length: columnCount }).map((_, index) => (
                <TableHead key={index} className="h-11">
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}

              {/* Colonne d'actions */}
              {showActions && (
                <TableHead style={{ width: "60px" }} className="h-11">
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {/* Colonne de sélection */}
                {showSelection && (
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                )}

                {/* Colonnes de données */}
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton
                      className="h-4"
                      style={{
                        width: `${Math.floor(Math.random() * 40) + 60}%`,
                      }}
                    />
                  </TableCell>
                ))}

                {/* Colonne d'actions */}
                {showActions && (
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between gap-8">
        {/* Sélecteur de taille de page */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-20" />
        </div>

        {/* Info de pagination */}
        <div className="flex grow justify-end">
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Boutons de pagination */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  )
}
