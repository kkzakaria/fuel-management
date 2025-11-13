/**
 * Filtres empilés pour les chauffeurs (mobile/tablette)
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
import type { ChauffeurFilters } from "@/lib/validations/chauffeur";

interface ChauffeurFiltersStackedProps {
  filters: ChauffeurFilters;
  onFiltersChange: (filters: Partial<ChauffeurFilters>) => void;
}

export function ChauffeurFiltersStacked({
  filters,
  onFiltersChange,
}: ChauffeurFiltersStackedProps) {
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
                  : (value as "actif" | "inactif" | "suspendu"),
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
            <SelectItem value="suspendu">Suspendu</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
