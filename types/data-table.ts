import { Column, ColumnDef, Table } from "@tanstack/react-table"
import { ReactNode } from "react"

/**
 * Configuration pour une colonne filtrable avec facettes
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
 *
 * @example
 * // Navigation vers une route
 * addButton={{ type: "link", href: "/trajets/nouveau", label: "Nouveau trajet" }}
 *
 * @example
 * // Ouverture d'un dialogue
 * addButton={{ type: "dialog", onClick: () => setDialogOpen(true), label: "Nouveau trajet" }}
 */
export type AddButtonConfig = AddButtonLinkConfig | AddButtonDialogConfig

/**
 * Props du composant DataTable
 */
export interface DataTableProps<TData> {
  /** Colonnes du tableau (TanStack Table ColumnDef) */
  columns: ColumnDef<TData, unknown>[]

  /** Données à afficher */
  data: TData[]

  /** État de chargement - affiche un skeleton si true */
  isLoading?: boolean

  /** Clé de la colonne pour la recherche globale (ex: "name", "email") */
  searchKey?: string

  /** Placeholder pour le champ de recherche */
  searchPlaceholder?: string

  /** Configuration des filtres par colonne */
  filterColumns?: FilterConfig[]

  /** Taille de page par défaut */
  pageSize?: number

  /** Options de taille de page */
  pageSizeOptions?: number[]

  /** Callback appelé lors du clic sur une ligne */
  onRowClick?: (row: TData) => void

  /** Activer la sélection multiple avec checkboxes */
  enableSelection?: boolean

  /** Activer le contrôle de visibilité des colonnes */
  enableColumnVisibility?: boolean

  /** Rendre l'en-tête du tableau fixe lors du scroll */
  stickyHeader?: boolean

  /** Composant d'actions personnalisées affiché dans la toolbar */
  actions?: (table: Table<TData>) => ReactNode

  /** Configuration du bouton d'ajout affiché dans la toolbar */
  addButton?: AddButtonConfig

  /** Callback pour les lignes sélectionnées (si enableSelection = true) */
  onSelectionChange?: (selectedRows: TData[]) => void
}

/**
 * Props du composant DataTableToolbar
 */
export interface DataTableToolbarProps<TData> {
  table: Table<TData>
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
export interface DataTableColumnHeaderProps<TData> {
  column: Column<TData>
  title: string
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
