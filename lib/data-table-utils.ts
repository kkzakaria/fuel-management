import { FilterFn, Row } from "@tanstack/react-table"

/**
 * Fonction de filtrage multi-colonnes
 * Recherche dans plusieurs colonnes d'une ligne
 *
 * @example
 * const column = {
 *   accessorKey: "name",
 *   filterFn: multiColumnFilterFn,
 * }
 */
export const multiColumnFilterFn = <TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string,
  searchKeys?: string[]
): boolean => {
  if (!filterValue) return true

  const searchTerm = filterValue.toLowerCase()

  // Si des clés de recherche sont fournies, chercher dans ces colonnes
  if (searchKeys && searchKeys.length > 0) {
    return searchKeys.some((key) => {
      const value = (row.original as Record<string, unknown>)[key]
      if (value == null) return false
      return String(value).toLowerCase().includes(searchTerm)
    })
  }

  // Sinon, chercher uniquement dans la colonne actuelle
  const value = row.getValue(columnId)
  if (value == null) return false
  return String(value).toLowerCase().includes(searchTerm)
}

/**
 * Fonction de filtrage par facettes (sélection multiple)
 * Utilisé pour les filtres avec checkboxes
 *
 * @example
 * const column = {
 *   accessorKey: "status",
 *   filterFn: facetedFilterFn,
 * }
 */
export const facetedFilterFn: FilterFn<unknown> = (
  row,
  columnId,
  filterValue: string[]
) => {
  if (!filterValue || filterValue.length === 0) return true

  const value = row.getValue(columnId)
  if (value == null) return false

  return filterValue.includes(String(value))
}

/**
 * Fonction de filtrage par date range
 * Filtre les lignes dont la date est dans une plage donnée
 *
 * @example
 * const column = {
 *   accessorKey: "created_at",
 *   filterFn: dateRangeFilterFn,
 * }
 */
export const dateRangeFilterFn: FilterFn<unknown> = (
  row,
  columnId,
  filterValue: { from?: Date; to?: Date }
) => {
  if (!filterValue || (!filterValue.from && !filterValue.to)) return true

  const cellValue = row.getValue(columnId)
  if (!cellValue) return false

  const date = new Date(cellValue as string | Date)
  if (isNaN(date.getTime())) return false

  if (filterValue.from && date < filterValue.from) return false
  if (filterValue.to && date > filterValue.to) return false

  return true
}

/**
 * Fonction de filtrage numérique par range
 * Filtre les lignes dont la valeur numérique est dans une plage donnée
 *
 * @example
 * const column = {
 *   accessorKey: "price",
 *   filterFn: numberRangeFilterFn,
 * }
 */
export const numberRangeFilterFn: FilterFn<unknown> = (
  row,
  columnId,
  filterValue: { min?: number; max?: number }
) => {
  if (!filterValue || (filterValue.min == null && filterValue.max == null)) {
    return true
  }

  const cellValue = row.getValue(columnId)
  if (cellValue == null) return false

  const numValue = Number(cellValue)
  if (isNaN(numValue)) return false

  if (filterValue.min != null && numValue < filterValue.min) return false
  if (filterValue.max != null && numValue > filterValue.max) return false

  return true
}

/**
 * Helper pour créer une colonne avec sélection
 * Retourne une définition de colonne pour la sélection multiple
 */
export function createSelectionColumn() {
  return {
    id: "select",
    size: 40,
    enableSorting: false,
    enableHiding: false,
  }
}

/**
 * Helper pour créer une colonne d'actions
 * Retourne une définition de colonne pour les actions de ligne
 */
export function createActionsColumn() {
  return {
    id: "actions",
    size: 60,
    enableSorting: false,
    enableHiding: false,
  }
}
