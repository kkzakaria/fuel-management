import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type Table,
  type VisibilityState,
} from "@tanstack/react-table"
import { type ReactNode } from "react"

/**
 * Option de filtre pour les filtres facettés
 */
export interface FilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * Configuration d'une colonne filtrable
 */
export interface FilterableColumn {
  id: string
  title: string
  options: FilterOption[]
}

/**
 * Configuration pour une colonne filtrable avec facettes (ancien format - compatibilité)
 */
export interface FilterConfig {
  /** Clé de la colonne à filtrer */
  key: string
  /** Label affiché pour le filtre */
  label: string
  /** Options de filtre (si non fourni, utilise les valeurs uniques de la colonne) */
  options?: Array<{
    label: string
    value: string
  }>
}

/**
 * Configuration pour le bouton d'ajout dans la toolbar (navigation vers une route)
 */
export interface AddButtonLinkConfig {
  /** Type de bouton : navigation vers une URL */
  type: "link"
  /** URL de navigation (ex: "/chauffeurs/nouveau") */
  href: string
  /** Label du bouton (ex: "Nouveau chauffeur") */
  label: string
  /** Permission requise pour afficher le bouton (défaut: true) */
  permission?: boolean
  /** Icône personnalisée (défaut: Plus de lucide-react) */
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * Configuration pour le bouton d'ajout dans la toolbar (ouverture d'un dialogue)
 */
export interface AddButtonDialogConfig {
  /** Type de bouton : ouverture d'un dialogue/modal */
  type: "dialog"
  /** Callback appelé lors du clic (ex: ouvrir un dialogue) */
  onClick: () => void
  /** Label du bouton (ex: "Nouveau chauffeur") */
  label: string
  /** Permission requise pour afficher le bouton (défaut: true) */
  permission?: boolean
  /** Icône personnalisée (défaut: Plus de lucide-react) */
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * Configuration pour le bouton d'ajout dans la toolbar
 */
export type AddButtonConfig = AddButtonLinkConfig | AddButtonDialogConfig

/**
 * Configuration de la toolbar DataTable
 */
export interface DataTableToolbarConfig<TData> {
  searchKey?: string
  searchPlaceholder?: string
  filterableColumns?: FilterableColumn[]
  onAdd?: () => void
  addLabel?: string
  addButton?: AddButtonConfig
  onImport?: (data: TData[]) => Promise<void>
  onExport?: () => void
  enableExport?: boolean
  enableImport?: boolean
}

/**
 * Props du composant DataTable principal
 */
export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]

  // Configuration de la toolbar
  toolbar?: DataTableToolbarConfig<TData>

  // Pagination
  pageSize?: number
  pageSizeOptions?: number[]
  enablePagination?: boolean

  // Pagination serveur
  manualPagination?: boolean
  pageCount?: number

  // Sélection
  enableRowSelection?: boolean
  onRowSelectionChange?: (selectedRows: TData[]) => void

  // Tri
  enableSorting?: boolean

  // Visibilité des colonnes
  enableColumnVisibility?: boolean

  // États
  isLoading?: boolean
  emptyMessage?: string

  // Avancé
  getRowId?: (row: TData) => string
  onRowClick?: (row: TData) => void
  stickyHeader?: boolean

  // État initial depuis l'URL (intégration nuqs)
  initialColumnFilters?: ColumnFiltersState
  initialSorting?: SortingState
  initialColumnVisibility?: VisibilityState
  initialPagination?: { pageIndex: number; pageSize: number }

  // Callbacks pour les changements d'état
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  onSortingChange?: (sorting: SortingState) => void
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
  onPaginationChange?: (pagination: {
    pageIndex: number
    pageSize: number
  }) => void
}

/**
 * Props du composant DataTableToolbar
 */
export interface DataTableToolbarProps<TData> {
  table: Table<TData>
  config?: DataTableToolbarConfig<TData>
  // Ancien format - compatibilité
  searchKey?: string
  searchPlaceholder?: string
  filterColumns?: FilterConfig[]
  enableColumnVisibility?: boolean
  actions?: ReactNode
  addButton?: AddButtonConfig
}

/**
 * Props du composant DataTablePagination
 */
export interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
}

/**
 * Props du composant DataTableColumnHeader
 */
export interface DataTableColumnHeaderProps<TData, TValue = unknown>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

/**
 * Props du composant DataTableFacetedFilter
 */
export interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: FilterOption[]
}

/**
 * Props du composant DataTableViewOptions
 */
export interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

/**
 * Props du composant DataTableSkeleton
 */
export interface DataTableSkeletonProps {
  /** Nombre de colonnes à afficher */
  columnCount?: number
  /** Nombre de lignes à afficher */
  rowCount?: number
  /** Afficher la colonne de sélection */
  showSelection?: boolean
  /** Afficher la colonne d'actions */
  showActions?: boolean
}

/**
 * Format d'export
 */
export type ExportFormat = "csv" | "excel"

/**
 * Configuration d'export
 */
export interface ExportConfig {
  filename?: string
  format: ExportFormat
  selectedOnly?: boolean
}

/**
 * Résultat d'import
 */
export interface ImportResult<TData> {
  data: TData[]
  errors: ImportError[]
  success: boolean
}

/**
 * Erreur d'import
 */
export interface ImportError {
  row: number
  field?: string
  message: string
}
