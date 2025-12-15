"use client"

import * as React from "react"
import { Download, Plus, Upload, X } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import type { DataTableToolbarProps } from "@/types/data-table"
import { exportToCSV, exportToExcel } from "@/lib/utils/export-utils"
import { parseCSV, parseExcel } from "@/lib/utils/import-utils"
import { toast } from "sonner"

/**
 * Barre d'outils du DataTable avec recherche, filtres, import/export et actions
 */
export function DataTableToolbar<TData>({
  table,
  config,
  // Ancien format - compatibilité
  searchKey: legacySearchKey,
  searchPlaceholder: legacySearchPlaceholder,
  actions,
  addButton: legacyAddButton,
}: DataTableToolbarProps<TData>) {
  // Utiliser la nouvelle config ou les props legacy
  const searchKey = config?.searchKey ?? legacySearchKey
  const searchPlaceholder = config?.searchPlaceholder ?? legacySearchPlaceholder ?? "Rechercher..."
  const addButton = config?.addButton ?? legacyAddButton

  const isFiltered = table.getState().columnFilters.length > 0
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const isCSV = file.name.endsWith(".csv")
      const result = isCSV
        ? await parseCSV<TData>(file)
        : await parseExcel<TData>(file)

      if (result.success && result.data.length > 0 && config?.onImport) {
        await config.onImport(result.data)
        toast.success(`${result.data.length} lignes importées avec succès`)
      } else if (result.errors.length > 0 && result.errors[0]) {
        toast.error(`Erreur d'import: ${result.errors[0].message}`)
      }
    } catch {
      toast.error("Échec de l'import du fichier")
    }

    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleExport = (format: "csv" | "excel") => {
    const hasSelection = table.getFilteredSelectedRowModel().rows.length > 0
    const selectedCount = table.getFilteredSelectedRowModel().rows.length
    const totalCount = table.getFilteredRowModel().rows.length

    if (format === "csv") {
      exportToCSV(table, "export.csv", hasSelection)
    } else {
      exportToExcel(table, "export.xlsx", hasSelection)
    }

    toast.success(
      hasSelection
        ? `${selectedCount} lignes sélectionnées exportées`
        : `${totalCount} lignes exportées`
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchKey && (
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {config?.filterableColumns?.map((filterColumn) => {
          const column = table.getColumn(filterColumn.id)
          return column ? (
            <DataTableFacetedFilter
              key={filterColumn.id}
              column={column}
              title={filterColumn.title}
              options={filterColumn.options}
            />
          ) : null
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Réinitialiser
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {/* Bouton d'ajout - nouveau format (config.onAdd) */}
        {config?.onAdd && (
          <Button onClick={config.onAdd} size="sm" className="h-8">
            <Plus className="mr-2 h-4 w-4" />
            {config.addLabel ?? "Ajouter"}
          </Button>
        )}

        {/* Bouton d'ajout - format legacy (addButton) */}
        {addButton && addButton.permission !== false && (
          addButton.type === "link" ? (
            <Button asChild size="sm" className="h-8">
              <Link href={addButton.href}>
                {addButton.icon ? (
                  <addButton.icon className="mr-2 h-4 w-4" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {addButton.label}
              </Link>
            </Button>
          ) : (
            <Button onClick={addButton.onClick} size="sm" className="h-8">
              {addButton.icon ? (
                <addButton.icon className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {addButton.label}
            </Button>
          )
        )}

        {/* Import */}
        {config?.enableImport && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Importer
            </Button>
          </>
        )}

        {/* Export */}
        {config?.enableExport && (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => handleExport("csv")}
          >
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        )}

        {/* Actions personnalisées legacy */}
        {actions}

        {/* Options de vue */}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
