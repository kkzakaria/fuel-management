"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  CircleXIcon,
  Columns3Icon,
  FilterIcon,
  ListFilterIcon,
  Plus,
  Search,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { DataTableToolbarProps } from "@/types/data-table"

/**
 * Barre d'outils responsive du DataTable
 *
 * Supporte deux modes :
 * 1. Mode interne (searchKey + filterColumns) - filtrage via TanStack Table
 * 2. Mode externe (externalSearch + responsiveFilters) - filtrage via Nuqs/URL
 *
 * Le mode externe permet une responsivité complète avec :
 * - Mobile/Tablette : Drawer pour les filtres
 * - Desktop : Dropdown ou inline pour les filtres
 *
 * @example Mode externe (recommandé pour Nuqs)
 * ```tsx
 * <DataTableToolbar
 *   table={table}
 *   externalSearch={{
 *     value: filters.search,
 *     onChange: (v) => updateFilters({ search: v }),
 *     placeholder: "Rechercher..."
 *   }}
 *   responsiveFilters={{
 *     mobileContent: <MyFiltersStacked filters={filters} onChange={updateFilters} />,
 *     desktopContent: <MyFiltersDropdown filters={filters} onChange={updateFilters} />,
 *     activeCount: activeFiltersCount,
 *     onClear: clearFilters,
 *     drawerTitle: "Filtres"
 *   }}
 *   addButton={{ type: "link", href: "/nouveau", label: "Nouveau" }}
 * />
 * ```
 */
export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Rechercher...",
  filterColumns = [],
  enableColumnVisibility = true,
  actions,
  addButton,
  // Nouvelles props responsives
  externalSearch,
  responsiveFilters,
  hideToolbar = false,
}: DataTableToolbarProps<TData>) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  // Debounce de la recherche externe
  const debouncedOnChange = useMemo(() => {
    if (!externalSearch) return undefined

    let timeoutId: NodeJS.Timeout | null = null
    return (value: string) => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        externalSearch.onChange(value)
      }, 300)
    }
  }, [externalSearch])

  // Cleanup du timeout au démontage
  useEffect(() => {
    return () => {
      // Le timeout sera nettoyé par le useMemo quand le composant se démonte
    }
  }, [])

  // Si hideToolbar est true, ne rien afficher
  if (hideToolbar) {
    return null
  }

  // Déterminer si on utilise le mode externe ou interne
  const useExternalMode = Boolean(externalSearch || responsiveFilters)

  // Rendu du mode externe (responsive avec Nuqs)
  if (useExternalMode) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {/* === MOBILE & TABLETTE : Recherche + Drawer filtres + Bouton === */}
        <div className="flex w-full items-center gap-3 xl:hidden">
          {/* Barre de recherche externe */}
          {externalSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={externalSearch.placeholder ?? searchPlaceholder}
                defaultValue={externalSearch.value}
                onChange={(e) => debouncedOnChange?.(e.target.value)}
                className="pl-9 pr-9"
                key={`mobile-search-${externalSearch.value === "" ? "empty" : "filled"}`}
              />
              {externalSearch.value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => externalSearch.onChange("")}
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Effacer la recherche</span>
                </Button>
              )}
            </div>
          )}

          {/* Drawer de filtres mobile/tablette */}
          {responsiveFilters && (
            <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative shrink-0">
                  <FilterIcon className="h-5 w-5" />
                  {responsiveFilters.activeCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute -right-2 -top-2 h-5 min-w-[20px] rounded-full px-1 text-xs"
                    >
                      {responsiveFilters.activeCount}
                    </Badge>
                  )}
                  <span className="sr-only">Filtrer</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="flex h-[85vh] flex-col">
                <SheetHeader>
                  <SheetTitle>{responsiveFilters.drawerTitle ?? "Filtres"}</SheetTitle>
                  <SheetDescription>
                    {responsiveFilters.drawerDescription ?? "Filtrer et affiner vos résultats"}
                  </SheetDescription>
                </SheetHeader>

                {/* Contenu scrollable */}
                <div className="flex-1 overflow-y-auto py-6">
                  {responsiveFilters.mobileContent}
                </div>

                {/* Boutons d'action fixes en bas */}
                <div className="flex-shrink-0 border-t px-1 pb-4 pt-4">
                  <div className="flex gap-3">
                    {responsiveFilters.activeCount > 0 && (
                      <Button
                        variant="outline"
                        onClick={responsiveFilters.onClear}
                        className="flex-1"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Réinitialiser
                      </Button>
                    )}
                    <Button
                      onClick={() => setMobileDrawerOpen(false)}
                      className="flex-1"
                    >
                      Appliquer{" "}
                      {responsiveFilters.activeCount > 0 &&
                        `(${responsiveFilters.activeCount})`}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* Bouton d'ajout mobile (icône seulement) */}
          {addButton && addButton.permission !== false && (
            addButton.type === "link" ? (
              <Button asChild size="icon" className="shrink-0">
                <Link href={addButton.href}>
                  {addButton.icon ? (
                    <addButton.icon className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                  <span className="sr-only">{addButton.label}</span>
                </Link>
              </Button>
            ) : (
              <Button size="icon" onClick={addButton.onClick} className="shrink-0">
                {addButton.icon ? (
                  <addButton.icon className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                <span className="sr-only">{addButton.label}</span>
              </Button>
            )
          )}
        </div>

        {/* === DESKTOP : Recherche + Filtres dropdown + Actions === */}
        <div className="hidden w-full items-center gap-3 xl:flex">
          {/* Barre de recherche externe */}
          {externalSearch && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={externalSearch.placeholder ?? searchPlaceholder}
                defaultValue={externalSearch.value}
                onChange={(e) => debouncedOnChange?.(e.target.value)}
                className="pl-9 pr-9"
                key={`desktop-search-${externalSearch.value === "" ? "empty" : "filled"}`}
              />
              {externalSearch.value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => externalSearch.onChange("")}
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Effacer la recherche</span>
                </Button>
              )}
            </div>
          )}

          {/* Filtres desktop (dropdown personnalisé) */}
          {responsiveFilters?.desktopContent}

          {/* Toggle visibilité des colonnes (uniquement si table est fourni) */}
          {enableColumnVisibility && table && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Columns3Icon
                    className="-ms-1 opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                  Colonnes
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Afficher les colonnes</DropdownMenuLabel>
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                        onSelect={(event) => event.preventDefault()}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions personnalisées */}
          {actions}

          {/* Bouton d'ajout desktop */}
          {addButton && addButton.permission !== false && (
            addButton.type === "link" ? (
              <Button asChild>
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
              <Button onClick={addButton.onClick}>
                {addButton.icon ? (
                  <addButton.icon className="mr-2 h-4 w-4" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {addButton.label}
              </Button>
            )
          )}
        </div>
      </div>
    )
  }

  // === Mode interne (TanStack Table) - ancien comportement ===
  // Requiert que table soit défini
  if (!table) {
    console.warn("DataTableToolbar: 'table' est requis en mode interne (searchKey/filterColumns)")
    return null
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Barre de recherche interne */}
        {searchKey && (
          <div className="relative">
            <Input
              id={`${id}-search`}
              ref={inputRef}
              className={cn(
                "peer min-w-60 ps-9",
                Boolean(table.getColumn(searchKey)?.getFilterValue()) && "pe-9"
              )}
              value={
                (table.getColumn(searchKey)?.getFilterValue() ?? "") as string
              }
              onChange={(e) =>
                table.getColumn(searchKey)?.setFilterValue(e.target.value)
              }
              placeholder={searchPlaceholder}
              type="text"
              aria-label={searchPlaceholder}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <ListFilterIcon size={16} aria-hidden="true" />
            </div>
            {Boolean(table.getColumn(searchKey)?.getFilterValue()) && (
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus:z-10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Effacer la recherche"
                onClick={() => {
                  table.getColumn(searchKey)?.setFilterValue("")
                  if (inputRef.current) {
                    inputRef.current.focus()
                  }
                }}
              >
                <CircleXIcon size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Filtres par colonne (mode interne) */}
        {filterColumns.map((filterConfig) => (
          <FilterPopover
            key={filterConfig.key}
            table={table}
            filterConfig={filterConfig}
            id={id}
          />
        ))}

        {/* Toggle visibilité des colonnes */}
        {enableColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns3Icon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Colonnes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Afficher les colonnes</DropdownMenuLabel>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                      onSelect={(event) => event.preventDefault()}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Actions personnalisées */}
      <div className="flex items-center gap-3">
        {/* Bouton d'ajout */}
        {addButton && addButton.permission !== false && (
          addButton.type === "link" ? (
            <Button asChild>
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
            <Button onClick={addButton.onClick}>
              {addButton.icon ? (
                <addButton.icon className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {addButton.label}
            </Button>
          )
        )}

        {/* Autres actions */}
        {actions}
      </div>
    </div>
  )
}

/**
 * Popover de filtrage par facettes avec checkboxes (mode interne)
 */
function FilterPopover<TData>({
  table,
  filterConfig,
  id,
}: {
  table: NonNullable<DataTableToolbarProps<TData>["table"]>
  filterConfig: NonNullable<DataTableToolbarProps<TData>["filterColumns"]>[number]
  id: string
}) {
  const column = table.getColumn(filterConfig.key)

  // Obtenir les valeurs uniques de la colonne
  const uniqueValues = useMemo(() => {
    if (!column) return []

    // Si des options sont fournies, les utiliser
    if (filterConfig.options && filterConfig.options.length > 0) {
      return filterConfig.options.map(
        (opt: { label: string; value: string }) => opt.value
      )
    }

    // Sinon, extraire les valeurs uniques de la colonne
    const values = Array.from(column.getFacetedUniqueValues().keys())
    return values.sort()
  }, [column, filterConfig.options])

  // Obtenir les compteurs pour chaque valeur
  const valueCounts = useMemo(() => {
    if (!column) return new Map()
    return column.getFacetedUniqueValues()
  }, [column])

  // Obtenir les valeurs sélectionnées
  const selectedValues = useMemo(() => {
    const filterValue = column?.getFilterValue() as string[]
    return filterValue ?? []
  }, [column])

  const handleValueChange = (checked: boolean, value: string) => {
    if (!column) return

    const filterValue = column.getFilterValue() as string[]
    const newFilterValue = filterValue ? [...filterValue] : []

    if (checked) {
      newFilterValue.push(value)
    } else {
      const index = newFilterValue.indexOf(value)
      if (index > -1) {
        newFilterValue.splice(index, 1)
      }
    }

    column.setFilterValue(newFilterValue.length ? newFilterValue : undefined)
  }

  if (!column) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <FilterIcon
            className="-ms-1 opacity-60"
            size={16}
            aria-hidden="true"
          />
          {filterConfig.label}
          {selectedValues.length > 0 && (
            <span className="-me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
              {selectedValues.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-36 p-3" align="start">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground">
            Filtres
          </div>
          <div className="space-y-3">
            {uniqueValues.map((value: string, i: number) => {
              // Obtenir le label depuis les options ou utiliser la valeur
              const option = filterConfig.options?.find(
                (opt: { label: string; value: string }) => opt.value === value
              )
              const label = option?.label ?? String(value)

              return (
                <div key={value} className="flex items-center gap-2">
                  <Checkbox
                    id={`${id}-${filterConfig.key}-${i}`}
                    checked={selectedValues.includes(String(value))}
                    onCheckedChange={(checked: boolean) =>
                      handleValueChange(checked, String(value))
                    }
                  />
                  <Label
                    htmlFor={`${id}-${filterConfig.key}-${i}`}
                    className="flex grow justify-between gap-2 font-normal"
                  >
                    {label}{" "}
                    <span className="ms-2 text-xs text-muted-foreground">
                      {valueCounts.get(value) ?? 0}
                    </span>
                  </Label>
                </div>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
