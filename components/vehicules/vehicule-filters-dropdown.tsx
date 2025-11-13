/**
 * Filtres en dropdown pour les véhicules (desktop)
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
import type { VehiculeFilters } from "@/lib/validations/vehicule";

interface VehiculeFiltersDropdownProps {
  filters: VehiculeFilters;
  onFiltersChange: (filters: Partial<VehiculeFilters>) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  triggerLabel?: string;
}

export function VehiculeFiltersDropdown({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFiltersCount,
  triggerLabel = "Filtrer",
}: VehiculeFiltersDropdownProps) {
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
      <PopoverContent className="w-96" align="start">
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

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="carburant-filter">Carburant</Label>
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
        </div>
      </PopoverContent>
    </Popover>
  );
}
