/**
 * DataTable - Composant de tableau réutilisable
 *
 * Exports centralisés pour le composant DataTable et tous ses sous-composants.
 *
 * @example
 * ```tsx
 * import {
 *   DataTable,
 *   DataTableColumnHeader,
 *   facetedFilterFn,
 *   multiColumnFilterFn,
 * } from "@/components/data-table"
 * ```
 */

// Composants principaux
export { DataTable } from "./data-table"
export { DataTableColumnHeader } from "./data-table-column-header"
export { DataTablePagination } from "./data-table-pagination"
export { DataTableSkeleton } from "./data-table-skeleton"
export { DataTableToolbar } from "./data-table-toolbar"

// Utilitaires et fonctions de filtrage
export {
  createActionsColumn,
  createSelectionColumn,
  dateRangeFilterFn,
  facetedFilterFn,
  multiColumnFilterFn,
  numberRangeFilterFn,
} from "@/lib/data-table-utils"

// Types
export type {
  DataTableColumnHeaderProps,
  DataTablePaginationProps,
  DataTableProps,
  DataTableSkeletonProps,
  DataTableToolbarProps,
  FilterConfig,
  // Nouveaux types pour le mode responsive
  ExternalSearchConfig,
  ResponsiveFiltersConfig,
  AddButtonConfig,
} from "@/types/data-table"
