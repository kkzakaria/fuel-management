/**
 * Composant Filtres pour les chauffeurs
 * Permet de filtrer la liste par statut et recherche
 */

"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { ChauffeurFilters } from "@/lib/validations/chauffeur";

interface ChauffeurFiltersProps {
  filters: ChauffeurFilters;
  onFiltersChange: (filters: Partial<ChauffeurFilters>) => void;
  onClearFilters: () => void;
}

export function ChauffeurFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: ChauffeurFiltersProps) {
  const hasActiveFilters = Boolean(filters.statut || filters.search);

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filtres</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2 lg:px-3"
          >
            <X className="mr-2 h-4 w-4" />
            Effacer
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* Recherche */}
        <div className="space-y-2 sm:col-span-2 lg:col-span-2">
          <Label htmlFor="search-filter">Recherche</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-filter"
              placeholder="Nom, prénom, téléphone..."
              value={filters.search || ""}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="pl-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
