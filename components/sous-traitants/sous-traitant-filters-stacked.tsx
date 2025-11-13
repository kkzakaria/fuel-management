/**
 * Filtres empilés pour les sous-traitants (mobile/tablette)
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
import type { SousTraitantFilters } from "@/lib/validations/sous-traitant";

interface SousTraitantFiltersStackedProps {
  filters: SousTraitantFilters;
  onFiltersChange: (filters: Partial<SousTraitantFilters>) => void;
}

export function SousTraitantFiltersStacked({
  filters,
  onFiltersChange,
}: SousTraitantFiltersStackedProps) {
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
                  : (value as "actif" | "inactif" | "blackliste"),
            })
          }
        >
          <SelectTrigger id="statut-filter">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les statuts</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="inactif">Inactif</SelectItem>
            <SelectItem value="blackliste">Blacklisté</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
