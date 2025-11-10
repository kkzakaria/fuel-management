/**
 * TrajetFiltersStacked - Filtres avec drawers empilés (mobile/tablette)
 * Utilise FilterButton + DateRangeDrawer + MultiSelectDrawer
 */

"use client";

import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Users,
  Truck,
  MapPin,
  ListFilter,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FilterButton } from "@/components/ui/filter-button";
import { DateRangeDrawer } from "@/components/ui/date-range-drawer";
import { MultiSelectDrawer, type MultiSelectOption } from "@/components/ui/multi-select-drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { TrajetFilters } from "@/lib/validations/trajet";

interface TrajetFiltersStackedProps {
  filters: TrajetFilters;
  onFiltersChange: (filters: {
    chauffeurIds?: string[];
    vehiculeIds?: string[];
    localiteArriveeIds?: string[];
    dateDebut?: string | null;
    dateFin?: string | null;
    statut?: "en_cours" | "termine" | "annule" | null;
    search?: string;
  }) => void;
  chauffeurs?: Array<{ id: string; nom: string; prenom: string }>;
  vehicules?: Array<{ id: string; immatriculation: string; marque?: string | null }>;
  localites?: Array<{ id: string; nom: string; region?: string | null }>;
}

export function TrajetFiltersStacked({
  filters,
  onFiltersChange,
  chauffeurs = [],
  vehicules = [],
  localites = [],
}: TrajetFiltersStackedProps) {
  // État des drawers secondaires
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);
  const [chauffeurDrawerOpen, setChauffeurDrawerOpen] = useState(false);
  const [vehiculeDrawerOpen, setVehiculeDrawerOpen] = useState(false);
  const [destinationDrawerOpen, setDestinationDrawerOpen] = useState(false);

  // Convertir les données pour MultiSelect
  const chauffeurOptions: MultiSelectOption[] = useMemo(
    () =>
      chauffeurs.map((c) => ({
        value: c.id,
        label: `${c.prenom} ${c.nom}`,
      })),
    [chauffeurs]
  );

  const vehiculeOptions: MultiSelectOption[] = useMemo(
    () =>
      vehicules.map((v) => ({
        value: v.id,
        label: v.immatriculation,
        secondary: v.marque || undefined,
      })),
    [vehicules]
  );

  const destinationOptions: MultiSelectOption[] = useMemo(
    () =>
      localites.map((l) => ({
        value: l.id,
        label: l.nom,
        secondary: l.region || undefined,
      })),
    [localites]
  );

  // Extraire les IDs des filtres (format: "id1,id2,id3")
  const selectedChauffeurIds = useMemo(
    () => (filters.chauffeur_id ? filters.chauffeur_id.split(",") : []),
    [filters.chauffeur_id]
  );

  const selectedVehiculeIds = useMemo(
    () => (filters.vehicule_id ? filters.vehicule_id.split(",") : []),
    [filters.vehicule_id]
  );

  const selectedDestinationIds = useMemo(
    () =>
      filters.localite_arrivee_id
        ? filters.localite_arrivee_id.split(",")
        : [],
    [filters.localite_arrivee_id]
  );

  // Helpers pour les aperçus
  const getDatePreview = () => {
    if (!filters.date_debut && !filters.date_fin) return undefined;
    if (filters.date_debut && filters.date_fin) {
      return `${format(new Date(filters.date_debut), "dd/MM/yy", { locale: fr })} - ${format(new Date(filters.date_fin), "dd/MM/yy", { locale: fr })}`;
    }
    if (filters.date_debut) {
      return `Depuis ${format(new Date(filters.date_debut), "dd/MM/yy", { locale: fr })}`;
    }
    return `Jusqu'au ${format(new Date(filters.date_fin!), "dd/MM/yy", { locale: fr })}`;
  };

  const getChauffeurPreview = () => {
    if (selectedChauffeurIds.length === 0) return undefined;
    const first = chauffeurs.find((c) => c.id === selectedChauffeurIds[0]);
    if (!first) return undefined;
    const preview = `${first.prenom} ${first.nom}`;
    return selectedChauffeurIds.length > 1
      ? `${preview}, +${selectedChauffeurIds.length - 1}`
      : preview;
  };

  const getVehiculePreview = () => {
    if (selectedVehiculeIds.length === 0) return undefined;
    const first = vehicules.find((v) => v.id === selectedVehiculeIds[0]);
    if (!first) return undefined;
    const preview = first.immatriculation;
    return selectedVehiculeIds.length > 1
      ? `${preview}, +${selectedVehiculeIds.length - 1}`
      : preview;
  };

  const getDestinationPreview = () => {
    if (selectedDestinationIds.length === 0) return undefined;
    const first = localites.find((l) => l.id === selectedDestinationIds[0]);
    if (!first) return undefined;
    const preview = first.nom;
    return selectedDestinationIds.length > 1
      ? `${preview}, +${selectedDestinationIds.length - 1}`
      : preview;
  };

  // Handlers
  const handleChauffeurChange = (values: string[]) => {
    onFiltersChange({
      chauffeurIds: values,
    });
  };

  const handleVehiculeChange = (values: string[]) => {
    onFiltersChange({
      vehiculeIds: values,
    });
  };

  const handleDestinationChange = (values: string[]) => {
    onFiltersChange({
      localiteArriveeIds: values,
    });
  };

  const handleDateRangeChange = (dateDebut?: string, dateFin?: string) => {
    onFiltersChange({ dateDebut, dateFin });
  };

  return (
    <div className="space-y-3">
      {/* Période */}
      <FilterButton
        icon={<CalendarIcon className="h-5 w-5" />}
        label="Période"
        selectedCount={
          filters.date_debut || filters.date_fin ? 1 : 0
        }
        preview={getDatePreview()}
        onClick={() => setDateDrawerOpen(true)}
      />

      {/* Chauffeurs */}
      <FilterButton
        icon={<Users className="h-5 w-5" />}
        label="Chauffeurs"
        selectedCount={selectedChauffeurIds.length}
        preview={getChauffeurPreview()}
        onClick={() => setChauffeurDrawerOpen(true)}
      />

      {/* Véhicules */}
      <FilterButton
        icon={<Truck className="h-5 w-5" />}
        label="Véhicules"
        selectedCount={selectedVehiculeIds.length}
        preview={getVehiculePreview()}
        onClick={() => setVehiculeDrawerOpen(true)}
      />

      {/* Destinations */}
      <FilterButton
        icon={<MapPin className="h-5 w-5" />}
        label="Destinations"
        selectedCount={selectedDestinationIds.length}
        preview={getDestinationPreview()}
        onClick={() => setDestinationDrawerOpen(true)}
      />

      {/* Statut (reste en Select simple) */}
      <div className="space-y-2">
        <Label htmlFor="statut" className="flex items-center gap-2">
          <ListFilter className="h-4 w-4" />
          Statut
        </Label>
        <Select
          value={filters.statut || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              statut:
                value === "all"
                  ? null
                  : (value as "en_cours" | "termine" | "annule"),
            })
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

      {/* Drawers secondaires */}
      <DateRangeDrawer
        open={dateDrawerOpen}
        onOpenChange={setDateDrawerOpen}
        dateDebut={filters.date_debut}
        dateFin={filters.date_fin}
        onDateRangeChange={handleDateRangeChange}
      />

      <MultiSelectDrawer
        open={chauffeurDrawerOpen}
        onOpenChange={setChauffeurDrawerOpen}
        title="Sélectionner des chauffeurs"
        description="Filtrer par chauffeur"
        options={chauffeurOptions}
        value={selectedChauffeurIds}
        onValueChange={handleChauffeurChange}
        searchPlaceholder="Rechercher un chauffeur..."
        emptyMessage="Aucun chauffeur trouvé"
      />

      <MultiSelectDrawer
        open={vehiculeDrawerOpen}
        onOpenChange={setVehiculeDrawerOpen}
        title="Sélectionner des véhicules"
        description="Filtrer par véhicule"
        options={vehiculeOptions}
        value={selectedVehiculeIds}
        onValueChange={handleVehiculeChange}
        searchPlaceholder="Rechercher un véhicule..."
        emptyMessage="Aucun véhicule trouvé"
      />

      <MultiSelectDrawer
        open={destinationDrawerOpen}
        onOpenChange={setDestinationDrawerOpen}
        title="Sélectionner des destinations"
        description="Filtrer par destination"
        options={destinationOptions}
        value={selectedDestinationIds}
        onValueChange={handleDestinationChange}
        searchPlaceholder="Rechercher une destination..."
        emptyMessage="Aucune destination trouvée"
      />
    </div>
  );
}
