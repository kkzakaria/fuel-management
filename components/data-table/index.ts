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
 *   DataTableFacetedFilter,
 *   facetedFilterFn,
 *   multiColumnFilterFn,
 * } from "@/components/data-table"
 * ```
 */

// Composants principaux
export { DataTable } from "./data-table"
export { DataTableColumnHeader } from "./data-table-column-header"
export { DataTableFacetedFilter } from "./data-table-faceted-filter"
export { DataTablePagination } from "./data-table-pagination"
export { DataTableSkeleton } from "./data-table-skeleton"
export { DataTableToolbar } from "./data-table-toolbar"
export { DataTableViewOptions } from "./data-table-view-options"

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
  AddButtonConfig,
  AddButtonDialogConfig,
  AddButtonLinkConfig,
  DataTableColumnHeaderProps,
  DataTableFacetedFilterProps,
  DataTablePaginationProps,
  DataTableProps,
  DataTableSkeletonProps,
  DataTableToolbarConfig,
  DataTableToolbarProps,
  DataTableViewOptionsProps,
  ExportConfig,
  ExportFormat,
  FilterableColumn,
  FilterConfig,
  FilterOption,
  ImportError,
  ImportResult,
} from "@/types/data-table"
