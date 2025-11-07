/**
 * Dropdown de filtres pour la liste des trajets
 * Avec sous-menus pour Date, Chauffeur, Véhicule, Destination, Statut
 */

"use client";

import { Calendar as CalendarIcon, X, User, Truck, MapPin, CheckCircle2, Check } from "lucide-react";
import { startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from "date-fns";
import type { DateRange, DropdownNavProps, DropdownProps } from "react-day-picker";
import { cn } from "@/lib/utils";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  // Convertir les filtres en DateRange pour le calendrier
  const dateRange: DateRange | undefined = filters.date_debut || filters.date_fin
    ? {
        from: filters.date_debut ? new Date(filters.date_debut) : undefined,
        to: filters.date_fin ? new Date(filters.date_fin) : undefined,
      }
    : undefined;

  // Gérer les changements de plage de dates
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (!range) {
      onFiltersChange({ dateDebut: null, dateFin: null });
      return;
    }

    onFiltersChange({
      dateDebut: range.from?.toISOString() ?? null,
      dateFin: range.to?.toISOString() ?? null,
    });
  };

  // Préréglages de dates
  const today = new Date();
  const datePresets = {
    today: { from: startOfDay(today), to: endOfDay(today) },
    last7days: { from: startOfDay(subDays(today, 6)), to: endOfDay(today) },
    last30days: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
    thisMonth: { from: startOfMonth(today), to: endOfMonth(today) },
    lastMonth: {
      from: startOfMonth(subDays(startOfMonth(today), 1)),
      to: endOfMonth(subDays(startOfMonth(today), 1)),
    },
  };

  const handleDatePreset = (preset: keyof typeof datePresets) => {
    const range = datePresets[preset];
    handleDateRangeChange(range);
  };

  // Helper pour gérer les changements de dropdown du calendrier
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

  // Vérifier si des filtres sont actifs
  const hasDateFilter = filters.date_debut || filters.date_fin;
  const hasChauffeurFilter = filters.chauffeur_id;
  const hasVehiculeFilter = filters.vehicule_id;
  const hasDestinationFilter = filters.localite_arrivee_id;
  const hasStatutFilter = filters.statut;

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
              {hasDateFilter && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="p-0 w-auto" onInteractOutside={(e) => e.preventDefault()}>
                <div className="flex" onClick={(e) => e.stopPropagation()}>
                  {/* Colonne des préréglages */}
                  <div className="border-r py-3 w-36">
                    <div className="flex flex-col px-2 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start h-8 text-xs"
                        onClick={() => handleDatePreset("today")}
                      >
                        Aujourd&apos;hui
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start h-8 text-xs"
                        onClick={() => handleDatePreset("last7days")}
                      >
                        7 derniers jours
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start h-8 text-xs"
                        onClick={() => handleDatePreset("last30days")}
                      >
                        30 derniers jours
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start h-8 text-xs"
                        onClick={() => handleDatePreset("thisMonth")}
                      >
                        Ce mois
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start h-8 text-xs"
                        onClick={() => handleDatePreset("lastMonth")}
                      >
                        Mois dernier
                      </Button>
                      {hasDateFilter && (
                        <>
                          <DropdownMenuSeparator className="my-1" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start h-8 text-xs text-muted-foreground"
                            onClick={() => handleDateRangeChange(undefined)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Effacer
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Calendrier en mode range avec dropdowns mois/année */}
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    className="p-3"
                    numberOfMonths={1}
                    classNames={{
                      month_caption: "mx-0",
                    }}
                    captionLayout="dropdown"
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
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Sous-menu Chauffeur */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <User size={16} className="opacity-60" aria-hidden="true" />
              <span>Chauffeur</span>
              {hasChauffeurFilter && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="p-0" onInteractOutside={(e) => e.preventDefault()}>
                <Command onClick={(e) => e.stopPropagation()}>
                  <CommandInput placeholder="Rechercher un chauffeur..." />
                  <CommandList>
                    <CommandEmpty>Aucun chauffeur trouvé.</CommandEmpty>
                    <CommandGroup>
                      {chauffeurs.map((c) => {
                        const isSelected = filters.chauffeur_id === c.id;
                        return (
                          <CommandItem
                            key={c.id}
                            value={`${c.prenom} ${c.nom}`}
                            onSelect={() => {
                              onFiltersChange({
                                chauffeurId: isSelected ? null : c.id
                              });
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {c.prenom} {c.nom}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Sous-menu Véhicule */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Truck size={16} className="opacity-60" aria-hidden="true" />
              <span>Véhicule</span>
              {hasVehiculeFilter && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="p-0" onInteractOutside={(e) => e.preventDefault()}>
                <Command onClick={(e) => e.stopPropagation()}>
                  <CommandInput placeholder="Rechercher un véhicule..." />
                  <CommandList>
                    <CommandEmpty>Aucun véhicule trouvé.</CommandEmpty>
                    <CommandGroup>
                      {vehicules.map((v) => {
                        const isSelected = filters.vehicule_id === v.id;
                        return (
                          <CommandItem
                            key={v.id}
                            value={`${v.immatriculation}${v.marque ? ` ${v.marque}` : ""}`}
                            onSelect={() => {
                              onFiltersChange({
                                vehiculeId: isSelected ? null : v.id
                              });
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {v.immatriculation}{v.marque ? ` (${v.marque})` : ""}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Sous-menu Destination */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <MapPin size={16} className="opacity-60" aria-hidden="true" />
              <span>Destination</span>
              {hasDestinationFilter && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="p-0" onInteractOutside={(e) => e.preventDefault()}>
                <Command onClick={(e) => e.stopPropagation()}>
                  <CommandInput placeholder="Rechercher une destination..." />
                  <CommandList>
                    <CommandEmpty>Aucune destination trouvée.</CommandEmpty>
                    <CommandGroup>
                      {localites.map((l) => {
                        const isSelected = filters.localite_arrivee_id === l.id;
                        return (
                          <CommandItem
                            key={l.id}
                            value={`${l.nom}${l.region ? ` ${l.region}` : ""}`}
                            onSelect={() => {
                              onFiltersChange({
                                localiteArriveeId: isSelected ? null : l.id
                              });
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {l.nom}{l.region ? ` (${l.region})` : ""}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Sous-menu Statut */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CheckCircle2 size={16} className="opacity-60" aria-hidden="true" />
              <span>Statut</span>
              {hasStatutFilter && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={filters.statut || "all"}
                  onValueChange={(value) =>
                    onFiltersChange({
                      statut: value === "all" ? null : (value as "en_cours" | "termine" | "annule"),
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
