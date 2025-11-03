import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { DataTableColumnHeaderProps } from "@/types/data-table"

/**
 * En-tête de colonne triable avec indicateurs visuels
 *
 * @example
 * const columns = [
 *   {
 *     accessorKey: "name",
 *     header: ({ column }) => (
 *       <DataTableColumnHeader column={column} title="Nom" />
 *     ),
 *   },
 * ]
 */
export function DataTableColumnHeader<TData>({
  column,
  title,
}: DataTableColumnHeaderProps<TData>) {
  if (!column.getCanSort()) {
    return <span>{title}</span>
  }

  return (
    <div
      className={cn(
        "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
      )}
      onClick={column.getToggleSortingHandler()}
      onKeyDown={(e) => {
        // Gestion du clavier pour l'accessibilité
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          column.getToggleSortingHandler()?.(e)
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Trier par ${title}`}
    >
      <span>{title}</span>
      {column.getIsSorted() === "asc" && (
        <ChevronUpIcon
          className="shrink-0 opacity-60"
          size={16}
          aria-hidden="true"
        />
      )}
      {column.getIsSorted() === "desc" && (
        <ChevronDownIcon
          className="shrink-0 opacity-60"
          size={16}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
