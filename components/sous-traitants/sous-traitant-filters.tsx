/**
 * Filtres pour la liste des sous-traitants
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { SousTraitantFilters } from "@/lib/validations/sous-traitant";

interface SousTraitantFiltersProps {
  filters: SousTraitantFilters;
  onFilterChange: (filters: Partial<SousTraitantFilters>) => void;
  onClearFilters: () => void;
}

export function SousTraitantFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: SousTraitantFiltersProps) {
  const hasActiveFilters = filters.statut || filters.search;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtres</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recherche */}
        <div className="space-y-2">
          <Label htmlFor="search">Recherche</Label>
          <Input
            id="search"
            placeholder="Nom, contact, téléphone..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
        </div>

        {/* Statut */}
        <div className="space-y-2">
          <Label htmlFor="statut">Statut</Label>
          <Select
            value={filters.statut || "tous"}
            onValueChange={(value) =>
              onFilterChange({
                statut: value === "tous" ? undefined : (value as "actif" | "inactif" | "blackliste"),
              })
            }
          >
            <SelectTrigger id="statut">
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
    </div>
  );
}
