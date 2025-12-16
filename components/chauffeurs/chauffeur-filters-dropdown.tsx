/**
 * Filtres en dropdown pour les chauffeurs (desktop)
 * Popover compact avec filtres horizontaux
 */

"use client";

import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { ChauffeurFilters } from "@/lib/validations/chauffeur";

interface ChauffeurFiltersDropdownProps {
  filters: ChauffeurFilters;
  onFiltersChange: (filters: Partial<ChauffeurFilters>) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  triggerLabel?: string;
}

export function ChauffeurFiltersDropdown({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFiltersCount,
  triggerLabel = "Filtrer",
}: ChauffeurFiltersDropdownProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          {triggerLabel}
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 rounded-full px-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtres</h4>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-8 px-2"
              >
                <X className="mr-1 h-4 w-4" />
                Effacer
              </Button>
            )}
          </div>

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
                      : (value as "actif" | "inactif" | "suspendu" | "en_voyage" | "en_conge"),
                })
              }
            >
              <SelectTrigger id="statut-filter">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="actif">Disponible</SelectItem>
                <SelectItem value="en_voyage">En voyage</SelectItem>
                <SelectItem value="en_conge">En congé</SelectItem>
                <SelectItem value="suspendu">Suspendu</SelectItem>
                <SelectItem value="inactif">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
