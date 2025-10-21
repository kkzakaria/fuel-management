/**
 * Composant Filtres pour les véhicules
 * Permet de filtrer la liste par statut, type carburant et recherche
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
import type { VehiculeFilters } from "@/lib/validations/vehicule";

interface VehiculeFiltersProps {
  filters: VehiculeFilters;
  onFiltersChange: (filters: Partial<VehiculeFilters>) => void;
  onClearFilters: () => void;
}

export function VehiculeFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: VehiculeFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.statut || filters.type_carburant || filters.search
  );

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Recherche */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="search-filter">Recherche</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-filter"
              placeholder="Immatriculation, marque, modèle..."
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
