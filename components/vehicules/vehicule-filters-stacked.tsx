/**
 * Filtres empilés pour les véhicules (mobile/tablette)
 * Version verticale des filtres pour drawer
 */

"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VehiculeFilters } from "@/lib/validations/vehicule";

interface VehiculeFiltersStackedProps {
  filters: VehiculeFilters;
  onFiltersChange: (filters: Partial<VehiculeFilters>) => void;
}

export function VehiculeFiltersStacked({
  filters,
  onFiltersChange,
}: VehiculeFiltersStackedProps) {
  return (
    <div className="space-y-4">
      {/* Filtre statut */}
      <div className="space-y-2">
        <Label htmlFor="statut-filter">Statut</Label>
        <Select
          value={filters.statut || "tous"}
          onValueChange={(value) =>
            onFiltersChange({
              statut:
                value === "tous"
                  ? undefined
                  : (value as "actif" | "maintenance" | "inactif" | "vendu"),
            })
          }
        >
          <SelectTrigger id="statut-filter">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les statuts</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="inactif">Inactif</SelectItem>
            <SelectItem value="vendu">Vendu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtre type carburant */}
      <div className="space-y-2">
        <Label htmlFor="carburant-filter">Type carburant</Label>
        <Select
          value={filters.type_carburant || "tous"}
          onValueChange={(value) =>
            onFiltersChange({
              type_carburant:
                value === "tous"
                  ? undefined
                  : (value as "gasoil" | "essence" | "hybride" | "electrique"),
            })
          }
        >
          <SelectTrigger id="carburant-filter">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les types</SelectItem>
            <SelectItem value="gasoil">Gasoil</SelectItem>
            <SelectItem value="essence">Essence</SelectItem>
            <SelectItem value="hybride">Hybride</SelectItem>
            <SelectItem value="electrique">Électrique</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
