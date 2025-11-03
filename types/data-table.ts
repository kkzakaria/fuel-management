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
