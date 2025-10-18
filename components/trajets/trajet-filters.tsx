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
import { Label } from "@/components/ui/label";
import type { TrajetFilters } from "@/lib/validations/trajet";

interface TrajetFiltersProps {
  filters: TrajetFilters;
  onFiltersChange: (filters: Partial<TrajetFilters>) => void;
  onClearFilters: () => void;
  chauffeurs?: Array<{ id: string; nom: string; prenom: string }>;
  vehicules?: Array<{ id: string; immatriculation: string; marque?: string }>;
  localites?: Array<{ id: string; nom: string; region?: string }>;
}

export function TrajetFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  chauffeurs = [],
  vehicules = [],
  localites = [],
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
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtres</h3>
        {hasActiveFilters && (
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
          <Select
            value={filters.chauffeur_id || "all"}
            onValueChange={(value) =>
              onFiltersChange({ chauffeur_id: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger id="chauffeur">
              <SelectValue placeholder="Tous les chauffeurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les chauffeurs</SelectItem>
              {chauffeurs.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.prenom} {c.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Véhicule */}
        <div className="space-y-2">
          <Label htmlFor="vehicule">Véhicule</Label>
          <Select
            value={filters.vehicule_id || "all"}
            onValueChange={(value) =>
              onFiltersChange({ vehicule_id: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger id="vehicule">
              <SelectValue placeholder="Tous les véhicules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les véhicules</SelectItem>
              {vehicules.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.immatriculation} {v.marque && `(${v.marque})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Select
            value={filters.localite_arrivee_id || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                localite_arrivee_id: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger id="destination">
              <SelectValue placeholder="Toutes les destinations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les destinations</SelectItem>
              {localites.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.nom} {l.region && `(${l.region})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Statut */}
        <div className="space-y-2">
          <Label htmlFor="statut">Statut</Label>
          <Select
            value={filters.statut || "all"}
            onValueChange={(value) =>
              onFiltersChange({ statut: value === "all" ? undefined : (value as any) })
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
