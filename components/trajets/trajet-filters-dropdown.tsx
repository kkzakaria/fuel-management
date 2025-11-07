/**
 * Dropdown de filtres pour la liste des trajets
 * Avec sous-menus pour Date, Chauffeur, Véhicule, Destination, Statut
 */

"use client";

import { Calendar as CalendarIcon, X, User, Truck, MapPin, CheckCircle2 } from "lucide-react";
import type { DropdownNavProps, DropdownProps } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import type { TrajetFilters } from "@/lib/validations/trajet";

// Type pour les mises à jour de filtres (format camelCase de Nuqs)
type FilterUpdate = {
  chauffeurId?: string | null;
  vehiculeId?: string | null;
  localiteArriveeId?: string | null;
  dateDebut?: string | null;
  dateFin?: string | null;
  statut?: "en_cours" | "termine" | "annule" | null;
  search?: string;
};

interface TrajetFiltersDropdownProps {
  filters: TrajetFilters;
  onFiltersChange: (filters: Partial<FilterUpdate>) => void;
  onClearFilters: () => void;
  chauffeurs?: Array<{ id: string; nom: string; prenom: string }>;
  vehicules?: Array<{ id: string; immatriculation: string; marque?: string | null }>;
  localites?: Array<{ id: string; nom: string; region?: string | null }>;
  activeFiltersCount?: number;
  triggerLabel?: string;
}

export function TrajetFiltersDropdown({
  filters,
  onFiltersChange,
  onClearFilters,
  chauffeurs = [],
  vehicules = [],
  localites = [],
  activeFiltersCount = 0,
  triggerLabel = "Filtrer",
}: TrajetFiltersDropdownProps) {
  const handleDateDebutChange = (date: Date | undefined) => {
    onFiltersChange({ dateDebut: date?.toISOString() });
  };

  const handleDateFinChange = (date: Date | undefined) => {
    onFiltersChange({ dateFin: date?.toISOString() });
  };

  const handleCalendarChange = (
    _value: string | number,
    _e: React.ChangeEventHandler<HTMLSelectElement>
  ) => {
    const _event = {
      target: {
        value: String(_value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    _e(_event);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative">
          {triggerLabel}
          {activeFiltersCount > 0 && (
            <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-secondary px-1.5 text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuGroup>
          {/* Sous-menu Période */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CalendarIcon size={16} className="opacity-60" aria-hidden="true" />
              <span>Période</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="p-0" onInteractOutside={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-3 p-3" onClick={(e) => e.stopPropagation()}>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Date début</p>
                    <Calendar
                      mode="single"
                      selected={filters.date_debut ? new Date(filters.date_debut) : undefined}
                      onSelect={handleDateDebutChange}
                      className="rounded-md border p-2"
                      classNames={{
                        month_caption: "mx-0",
                      }}
                      captionLayout="dropdown"
                      defaultMonth={filters.date_debut ? new Date(filters.date_debut) : new Date()}
                      startMonth={new Date(2020, 0)}
                      endMonth={new Date(2030, 11)}
                      hideNavigation
                      components={{
                        DropdownNav: (props: DropdownNavProps) => {
                          return (
                            <div className="flex w-full items-center gap-2">
                              {props.children}
                            </div>
                          );
                        },
                        Dropdown: (props: DropdownProps) => {
                          return (
                            <Select
                              value={String(props.value)}
                              onValueChange={(value) => {
                                if (props.onChange) {
                                  handleCalendarChange(value, props.onChange);
                                }
                              }}
                            >
                              <SelectTrigger className="h-8 w-fit font-medium first:grow">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                                {props.options?.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={String(option.value)}
                                    disabled={option.disabled}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          );
                        },
                      }}
                    />
                  </div>
                  {filters.date_debut && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Date fin</p>
                        <Calendar
                          mode="single"
                          selected={filters.date_fin ? new Date(filters.date_fin) : undefined}
                          onSelect={handleDateFinChange}
                          className="rounded-md border p-2"
                          classNames={{
                            month_caption: "mx-0",
                          }}
                          captionLayout="dropdown"
                          defaultMonth={filters.date_fin ? new Date(filters.date_fin) : new Date()}
                          startMonth={new Date(2020, 0)}
                          endMonth={new Date(2030, 11)}
                          hideNavigation
                          components={{
                            DropdownNav: (props: DropdownNavProps) => {
                              return (
                                <div className="flex w-full items-center gap-2">
                                  {props.children}
                                </div>
                              );
                            },
                            Dropdown: (props: DropdownProps) => {
                              return (
                                <Select
                                  value={String(props.value)}
                                  onValueChange={(value) => {
                                    if (props.onChange) {
                                      handleCalendarChange(value, props.onChange);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8 w-fit font-medium first:grow">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                                    {props.options?.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={String(option.value)}
                                        disabled={option.disabled}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              );
                            },
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Sous-menu Chauffeur */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <User size={16} className="opacity-60" aria-hidden="true" />
              <span>Chauffeur</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="p-3" onInteractOutside={(e) => e.preventDefault()}>
                <div onClick={(e) => e.stopPropagation()}>
                  <Combobox
                    options={[
                      { value: "all", label: "Tous les chauffeurs" },
                      ...chauffeurs.map((c) => ({
                        value: c.id,
                        label: `${c.prenom} ${c.nom}`,
                      })),
                    ]}
                    value={filters.chauffeur_id || "all"}
                    onValueChange={(value) =>
                      onFiltersChange({ chauffeurId: value === "all" ? undefined : value })
                    }
                    placeholder="Tous les chauffeurs"
                    searchPlaceholder="Rechercher un chauffeur..."
                    emptyMessage="Aucun chauffeur trouvé."
                  />
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Sous-menu Véhicule */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Truck size={16} className="opacity-60" aria-hidden="true" />
              <span>Véhicule</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="p-3" onInteractOutside={(e) => e.preventDefault()}>
                <div onClick={(e) => e.stopPropagation()}>
                  <Combobox
                    options={[
                      { value: "all", label: "Tous les véhicules" },
                      ...vehicules.map((v) => ({
                        value: v.id,
                        label: `${v.immatriculation}${v.marque ? ` (${v.marque})` : ""}`,
                      })),
                    ]}
                    value={filters.vehicule_id || "all"}
                    onValueChange={(value) =>
                      onFiltersChange({ vehiculeId: value === "all" ? undefined : value })
                    }
                    placeholder="Tous les véhicules"
                    searchPlaceholder="Rechercher un véhicule..."
                    emptyMessage="Aucun véhicule trouvé."
                  />
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Sous-menu Destination */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <MapPin size={16} className="opacity-60" aria-hidden="true" />
              <span>Destination</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="p-3" onInteractOutside={(e) => e.preventDefault()}>
                <div onClick={(e) => e.stopPropagation()}>
                  <Combobox
                    options={[
                      { value: "all", label: "Toutes les destinations" },
                      ...localites.map((l) => ({
                        value: l.id,
                        label: `${l.nom}${l.region ? ` (${l.region})` : ""}`,
                      })),
                    ]}
                    value={filters.localite_arrivee_id || "all"}
                    onValueChange={(value) =>
                      onFiltersChange({
                        localiteArriveeId: value === "all" ? undefined : value,
                      })
                    }
                    placeholder="Toutes les destinations"
                    searchPlaceholder="Rechercher une destination..."
                    emptyMessage="Aucune destination trouvée."
                  />
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Sous-menu Statut */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CheckCircle2 size={16} className="opacity-60" aria-hidden="true" />
              <span>Statut</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={filters.statut || "all"}
                  onValueChange={(value) =>
                    onFiltersChange({
                      statut: value === "all" ? undefined : (value as "en_cours" | "termine" | "annule"),
                    })
                  }
                >
                  <DropdownMenuRadioItem value="all">
                    Tous les statuts
                  </DropdownMenuRadioItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioItem value="en_cours">
                    En cours
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="termine">
                    Terminé
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="annule">
                    Annulé
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Réinitialiser */}
        <DropdownMenuItem onClick={onClearFilters}>
          <X size={16} className="opacity-60" aria-hidden="true" />
          <span>Réinitialiser les filtres</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
