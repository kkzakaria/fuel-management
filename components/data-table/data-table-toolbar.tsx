import {
  CircleXIcon,
  Columns3Icon,
  FilterIcon,
  ListFilterIcon,
} from "lucide-react"
import { useId, useMemo, useRef } from "react"

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
import { cn } from "@/lib/utils"
import { DataTableToolbarProps } from "@/types/data-table"

/**
 * Barre d'outils du DataTable avec recherche, filtres et actions
 *
 * @example
 * <DataTableToolbar
 *   table={table}
 *   searchKey="name"
 *   searchPlaceholder="Rechercher par nom..."
 *   filterColumns={[{ key: "status", label: "Statut" }]}
 *   enableColumnVisibility
 *   actions={<Button>Exporter</Button>}
 * />
 */
export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Rechercher...",
  filterColumns = [],
  enableColumnVisibility = true,
  actions,
}: DataTableToolbarProps<TData>) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Barre de recherche */}
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
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* Filtres par colonne */}
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
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}

/**
 * Popover de filtrage par facettes avec checkboxes
 */
function FilterPopover<TData>({
  table,
  filterConfig,
  id,
}: {
  table: DataTableToolbarProps<TData>["table"]
  filterConfig: NonNullable<DataTableToolbarProps<TData>["filterColumns"]>[number]
  id: string
}) {
  const column = table.getColumn(filterConfig.key)

  // Obtenir les valeurs uniques de la colonne
  const uniqueValues = useMemo(() => {
    if (!column) return []

    // Si des options sont fournies, les utiliser
    if (filterConfig.options && filterConfig.options.length > 0) {
      return filterConfig.options.map((opt: { label: string; value: string }) => opt.value)
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
