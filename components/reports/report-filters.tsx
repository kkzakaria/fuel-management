/**
 * Report Filters Component
 *
 * Advanced filters for report generation (date range, period, driver, vehicle, destination)
 */

"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ReportType } from "@/lib/report-types";
import { getPresetDateRange } from "@/lib/date-utils";
import {
  fetchDriversList,
  fetchVehiclesList,
  fetchDestinationsList,
} from "@/lib/supabase/report-queries-client";

export interface ReportFiltersState {
  reportType: ReportType | null;
  dateFrom: Date;
  dateTo: Date;
  chauffeurId?: string;
  vehiculeId?: string;
  destinationId?: string;
}

interface ReportFiltersProps {
  filters: ReportFiltersState;
  onFiltersChange: (filters: ReportFiltersState) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export function ReportFilters({
  filters,
  onFiltersChange,
  onGenerate,
  isGenerating = false,
}: ReportFiltersProps) {
  const [drivers, setDrivers] = useState<
    { id: string; nom: string; prenom: string }[]
  >([]);
  const [vehicles, setVehicles] = useState<
    { id: string; immatriculation: string; marque: string; modele: string }[]
  >([]);
  const [destinations, setDestinations] = useState<
    { id: string; nom: string; region: string }[]
  >([]);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month" | "quarter" | "custom"
  >("month");

  // Load dropdown data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load data with detailed error handling for each resource
        const driversPromise = fetchDriversList().catch((err) => {
          console.error("Failed to load drivers:", err);
          return [];
        });

        const vehiclesPromise = fetchVehiclesList().catch((err) => {
          console.error("Failed to load vehicles:", err);
          return [];
        });

        const destinationsPromise = fetchDestinationsList().catch((err) => {
          console.error("Failed to load destinations:", err);
          return [];
        });

        const [driversData, vehiclesData, destinationsData] =
          await Promise.all([
            driversPromise,
            vehiclesPromise,
            destinationsPromise,
          ]);

        setDrivers(driversData);
        setVehicles(vehiclesData);
        setDestinations(destinationsData);

        console.log("Filter data loaded:", {
          drivers: driversData.length,
          vehicles: vehiclesData.length,
          destinations: destinationsData.length,
        });
      } catch (error) {
        console.error("Unexpected error loading filter data:", error);
      }
    };

    loadData();
  }, []);

  const handlePeriodChange = (period: "today" | "week" | "month" | "quarter" | "custom") => {
    setSelectedPeriod(period);

    if (period !== "custom") {
      const range = getPresetDateRange(period as "today" | "week" | "month" | "quarter");
      onFiltersChange({
        ...filters,
        dateFrom: range.from,
        dateTo: range.to,
      });
    }
  };

  const handleDateRangeChange = (from: Date | undefined, to: Date | undefined) => {
    if (from && to) {
      setSelectedPeriod("custom");
      onFiltersChange({
        ...filters,
        dateFrom: from,
        dateTo: to,
      });
    }
  };

  const handleClearFilters = () => {
    const range = getPresetDateRange("month");
    onFiltersChange({
      ...filters,
      chauffeurId: undefined,
      vehiculeId: undefined,
      destinationId: undefined,
      dateFrom: range.from,
      dateTo: range.to,
    });
    setSelectedPeriod("month");
  };

  const hasActiveFilters =
    filters.chauffeurId || filters.vehiculeId || filters.destinationId;

  const canGenerate =
    filters.reportType &&
    filters.dateFrom &&
    filters.dateTo &&
    (filters.reportType !== "driver" || filters.chauffeurId) &&
    (filters.reportType !== "vehicle" || filters.vehiculeId) &&
    (filters.reportType !== "destination" || filters.destinationId);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="space-y-2">
        <Label>Période</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedPeriod === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange("today")}
          >
            Aujourd&apos;hui
          </Button>
          <Button
            variant={selectedPeriod === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange("week")}
          >
            Cette semaine
          </Button>
          <Button
            variant={selectedPeriod === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange("month")}
          >
            Ce mois
          </Button>
          <Button
            variant={selectedPeriod === "quarter" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange("quarter")}
          >
            3 derniers mois
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={selectedPeriod === "custom" ? "default" : "outline"}
                size="sm"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Personnalisée
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: filters.dateFrom,
                  to: filters.dateTo,
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    handleDateRangeChange(range.from, range.to);
                  }
                }}
                locale={fr}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date Range Display */}
        <div className="text-sm text-muted-foreground">
          Du {format(filters.dateFrom, "d MMM yyyy", { locale: fr })} au{" "}
          {format(filters.dateTo, "d MMM yyyy", { locale: fr })}
        </div>
      </div>

      {/* Entity-specific Filters */}
      {filters.reportType && (
        <div className="space-y-4">
          {/* Driver Filter (required for driver report) */}
          {(filters.reportType === "driver" ||
            filters.reportType === "monthly" ||
            filters.reportType === "financial") && (
            <div className="space-y-2">
              <Label htmlFor="driver-select">
                Chauffeur{filters.reportType === "driver" && " *"}
              </Label>
              <Select
                value={filters.chauffeurId || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    chauffeurId: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger id="driver-select">
                  <SelectValue placeholder="Tous les chauffeurs" />
                </SelectTrigger>
                <SelectContent>
                  {filters.reportType !== "driver" && (
                    <SelectItem value="all">Tous les chauffeurs</SelectItem>
                  )}
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.prenom} {driver.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Vehicle Filter (required for vehicle report) */}
          {(filters.reportType === "vehicle" ||
            filters.reportType === "monthly" ||
            filters.reportType === "financial") && (
            <div className="space-y-2">
              <Label htmlFor="vehicle-select">
                Véhicule{filters.reportType === "vehicle" && " *"}
              </Label>
              <Select
                value={filters.vehiculeId || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    vehiculeId: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger id="vehicle-select">
                  <SelectValue placeholder="Tous les véhicules" />
                </SelectTrigger>
                <SelectContent>
                  {filters.reportType !== "vehicle" && (
                    <SelectItem value="all">Tous les véhicules</SelectItem>
                  )}
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.immatriculation} - {vehicle.marque}{" "}
                      {vehicle.modele}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Destination Filter (required for destination report) */}
          {(filters.reportType === "destination" ||
            filters.reportType === "monthly" ||
            filters.reportType === "financial") && (
            <div className="space-y-2">
              <Label htmlFor="destination-select">
                Destination{filters.reportType === "destination" && " *"}
              </Label>
              <Select
                value={filters.destinationId || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    destinationId: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger id="destination-select">
                  <SelectValue placeholder="Toutes les destinations" />
                </SelectTrigger>
                <SelectContent>
                  {filters.reportType !== "destination" && (
                    <SelectItem value="all">Toutes les destinations</SelectItem>
                  )}
                  {destinations.map((destination) => (
                    <SelectItem key={destination.id} value={destination.id}>
                      {destination.nom}
                      {destination.region && ` (${destination.region})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 border-t pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
        >
          <X className="mr-2 h-4 w-4" />
          Réinitialiser les filtres
        </Button>

        <Button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          size="lg"
        >
          <Filter className="mr-2 h-4 w-4" />
          {isGenerating ? "Génération..." : "Générer le rapport"}
        </Button>
      </div>
    </div>
  );
}
