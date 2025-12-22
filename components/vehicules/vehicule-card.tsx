/**
 * Vehicle Card Component - Industrial Design
 *
 * Bold, utilitarian card with:
 * - Edge status indicator (left border)
 * - Monospace plate number
 * - Fuel type badges
 * - Swipe-friendly for mobile
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Eye,
  Edit,
  Fuel,
  Gauge,
  MoreVertical,
  Trash2,
  Truck,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Vehicule } from "@/lib/supabase/types";
import { VehiculeDeleteDialog } from "./vehicule-delete-dialog";

// Status configuration with industrial colors
const STATUS_CONFIG = {
  actif: {
    label: "Actif",
    borderClass: "border-l-emerald-500",
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  en_reparation: {
    label: "En réparation",
    borderClass: "border-l-amber-500",
    bgClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-50 dark:bg-amber-950/30",
  },
  maintenance: {
    label: "Maintenance",
    borderClass: "border-l-amber-500",
    bgClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-50 dark:bg-amber-950/30",
  },
  inactif: {
    label: "Inactif",
    borderClass: "border-l-slate-400",
    bgClass: "bg-slate-400",
    textClass: "text-slate-500 dark:text-slate-400",
    badgeBg: "bg-slate-100 dark:bg-slate-800/30",
  },
} as const;

// Fuel type configuration
const FUEL_CONFIG = {
  diesel: {
    label: "Diesel",
    bgClass: "bg-amber-100 dark:bg-amber-950/40",
    textClass: "text-amber-700 dark:text-amber-400",
  },
  gasoil: {
    label: "Gasoil",
    bgClass: "bg-amber-100 dark:bg-amber-950/40",
    textClass: "text-amber-700 dark:text-amber-400",
  },
  essence: {
    label: "Essence",
    bgClass: "bg-sky-100 dark:bg-sky-950/40",
    textClass: "text-sky-700 dark:text-sky-400",
  },
} as const;

interface VehiculeCardProps {
  vehicule: Vehicule;
  index?: number;
}

export function VehiculeCard({ vehicule, index = 0 }: VehiculeCardProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const statusConfig =
    STATUS_CONFIG[(vehicule.statut as keyof typeof STATUS_CONFIG) || "actif"] ||
    STATUS_CONFIG.actif;

  const fuelConfig = vehicule.type_carburant
    ? FUEL_CONFIG[vehicule.type_carburant as keyof typeof FUEL_CONFIG] || null
    : null;

  const handleClick = () => {
    router.push(`/vehicules/${vehicule.id}`);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-xl border-l-4 bg-card",
          "border border-border/50 transition-all duration-300 ease-out",
          "hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-black/5",
          "active:scale-[0.99]",
          statusConfig.borderClass,
          "animate-fade-in opacity-0"
        )}
        style={{ animationDelay: `${index * 40}ms` }}
      >
        <div className="p-4">
          {/* Header: Plate number + Actions */}
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Plate number - Industrial monospace style */}
              <div
                className={cn(
                  "rounded-lg px-2.5 py-1",
                  "bg-slate-900 dark:bg-slate-800",
                  "font-mono text-sm font-bold tracking-wide text-white"
                )}
              >
                {vehicule.immatriculation}
              </div>

              {/* Fuel type badge */}
              {fuelConfig && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                    fuelConfig.bgClass,
                    fuelConfig.textClass
                  )}
                >
                  <Fuel className="h-3 w-3" />
                  {fuelConfig.label}
                </span>
              )}
            </div>

            {/* Actions dropdown */}
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-60 transition-opacity group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/vehicules/${vehicule.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détails
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/vehicules/${vehicule.id}/modifier`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Vehicle info */}
          <div className="mb-3 flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                "bg-slate-100 dark:bg-slate-800"
              )}
            >
              <Truck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {vehicule.marque || "Marque inconnue"} {vehicule.modele || ""}
              </p>
            </div>
          </div>

          {/* Info row: Year + Mileage */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-dashed border-border/50 pt-3 text-sm">
            {/* Year */}
            {vehicule.annee && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{vehicule.annee}</span>
              </div>
            )}

            {/* Mileage */}
            {vehicule.kilometrage_actuel && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Gauge className="h-3.5 w-3.5" />
                <span className="font-mono tabular-nums">
                  {vehicule.kilometrage_actuel.toLocaleString("fr-FR")} km
                </span>
              </div>
            )}
          </div>

          {/* Footer: Status badge + View hint */}
          <div className="mt-3 flex items-center justify-between">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
                statusConfig.badgeBg,
                statusConfig.textClass
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.bgClass)} />
              {statusConfig.label}
            </span>

            <div
              className={cn(
                "flex items-center gap-1 text-xs text-muted-foreground",
                "opacity-0 transition-opacity group-hover:opacity-100"
              )}
            >
              <span>Voir détails</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>

      <VehiculeDeleteDialog
        vehicule={vehicule}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}

// Grid wrapper for tablet view
interface VehiculeCardGridProps {
  vehicules: Vehicule[];
  loading?: boolean;
}

export function VehiculeCardGrid({ vehicules, loading }: VehiculeCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl bg-muted"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  if (vehicules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Truck className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">Aucun véhicule trouvé</h3>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Aucun véhicule ne correspond à vos critères de recherche. Essayez de modifier
          vos filtres.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {vehicules.map((vehicule, index) => (
        <VehiculeCard key={vehicule.id} vehicule={vehicule} index={index} />
      ))}
    </div>
  );
}

// Mobile list wrapper
interface VehiculeCardListProps {
  vehicules: Vehicule[];
  loading?: boolean;
}

export function VehiculeCardList({ vehicules, loading }: VehiculeCardListProps) {
  if (loading && vehicules.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-xl bg-muted"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  if (vehicules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Truck className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">Aucun véhicule trouvé</h3>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Aucun véhicule ne correspond à vos critères de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vehicules.map((vehicule, index) => (
        <VehiculeCard key={vehicule.id} vehicule={vehicule} index={index} />
      ))}
    </div>
  );
}
