/**
 * Filtres pour la liste des trajets
 * Date range, chauffeur, véhicule, destination, statut
 */

"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import type { TrajetFilters } from "@/lib/validations/trajet";

interface TrajetFiltersProps {
  filters: TrajetFilters;
  onFiltersChange: (filters: Partial<TrajetFilters>) => void;
  onClearFilters: () => void;
  chauffeurs?: Array<{ id: string; nom: string; prenom: string }>;
  vehicules?: Array<{ id: string; immatriculation: string; marque?: string | null }>;
  localites?: Array<{ id: string; nom: string; region?: string | null }>;
  /** Masquer le bouton de réinitialisation interne (utilisé dans les drawers) */
  hideClearButton?: boolean;
  /** Afficher les filtres en colonne unique (pour les drawers) */
  singleColumn?: boolean;
}

export function TrajetFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  chauffeurs = [],
  vehicules = [],
  localites = [],
  hideClearButton = false,
  singleColumn = false,
}: TrajetFiltersProps) {
  const [dateDebut, setDateDebut] = useState<Date | undefined>(
    filters.date_debut ? new Date(filters.date_debut) : undefined
  );
  const [dateFin, setDateFin] = useState<Date | undefined>(
    filters.date_fin ? new Date(filters.date_fin) : undefined
  );

  const handleDateDebutChange = (date: Date | undefined) => {
    setDateDebut(date);
    onFiltersChange({ date_debut: date?.toISOString() });
  };

  const handleDateFinChange = (date: Date | undefined) => {
    setDateFin(date);
    onFiltersChange({ date_fin: date?.toISOString() });
  };

  const hasActiveFilters =
    filters.chauffeur_id ||
    filters.vehicule_id ||
    filters.localite_arrivee_id ||
    filters.date_debut ||
    filters.date_fin ||
    filters.statut;

  return (
    <div className={singleColumn ? "space-y-4" : "space-y-4 rounded-lg border p-4"}>
      {!singleColumn && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Filtres</h3>
          {!hideClearButton && hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClearFilters();
                setDateDebut(undefined);
                setDateFin(undefined);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>
      )}

      <div className={singleColumn ? "space-y-4" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"}>
        {/* Date début */}
        <div className="space-y-2">
          <Label htmlFor="date-debut">Date début</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-debut"
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateDebut ? (
                  format(dateDebut, "dd MMM yyyy", { locale: fr })
                ) : (
                  <span className="text-muted-foreground">Choisir une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateDebut}
                onSelect={handleDateDebutChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date fin */}
        <div className="space-y-2">
          <Label htmlFor="date-fin">Date fin</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-fin"
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFin ? (
                  format(dateFin, "dd MMM yyyy", { locale: fr })
                ) : (
                  <span className="text-muted-foreground">Choisir une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFin}
                onSelect={handleDateFinChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Chauffeur */}
        <div className="space-y-2">
          <Label htmlFor="chauffeur">Chauffeur</Label>
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
              onFiltersChange({ chauffeur_id: value === "all" ? undefined : value })
            }
            placeholder="Tous les chauffeurs"
            searchPlaceholder="Rechercher un chauffeur..."
            emptyMessage="Aucun chauffeur trouvé."
          />
        </div>

        {/* Véhicule */}
        <div className="space-y-2">
          <Label htmlFor="vehicule">Véhicule</Label>
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
              onFiltersChange({ vehicule_id: value === "all" ? undefined : value })
            }
            placeholder="Tous les véhicules"
            searchPlaceholder="Rechercher un véhicule..."
            emptyMessage="Aucun véhicule trouvé."
          />
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
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
                localite_arrivee_id: value === "all" ? undefined : value,
              })
            }
            placeholder="Toutes les destinations"
            searchPlaceholder="Rechercher une destination..."
            emptyMessage="Aucune destination trouvée."
          />
        </div>

        {/* Statut */}
        <div className="space-y-2">
          <Label htmlFor="statut">Statut</Label>
          <Select
            value={filters.statut || "all"}
            onValueChange={(value) =>
              onFiltersChange({ statut: value === "all" ? undefined : (value as "en_cours" | "termine" | "annule") })
            }
          >
            <SelectTrigger id="statut">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="en_cours">En cours</SelectItem>
              <SelectItem value="termine">Terminé</SelectItem>
              <SelectItem value="annule">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
