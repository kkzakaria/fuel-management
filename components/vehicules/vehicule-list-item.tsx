/**
 * Vehicle List Item Component - Industrial Design
 *
 * Compact mobile-optimized list item with:
 * - Edge status indicator (left border)
 * - Monospace plate number badge
 * - Fuel type badge
 * - Touch-friendly actions
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Edit,
  Eye,
  Fuel,
  Gauge,
  MoreVertical,
  Trash2,
  Truck,
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

interface VehiculeListItemProps {
  vehicule: Vehicule;
  index?: number;
}

export function VehiculeListItem({ vehicule, index = 0 }: VehiculeListItemProps) {
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
          "group relative cursor-pointer border-l-4 bg-card",
          "border-b border-border/50 transition-all duration-200",
          "hover:bg-muted/50 active:bg-muted active:scale-[0.99]",
          statusConfig.borderClass,
          "animate-fade-in opacity-0"
        )}
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <div className="flex items-center gap-3 p-3">
          {/* Vehicle icon */}
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              "bg-slate-100 dark:bg-slate-800"
            )}
          >
            <Truck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>

          {/* Main content */}
          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Row 1: Plate number + Fuel type */}
            <div className="flex items-center gap-2">
              {/* Plate number - Industrial monospace style */}
              <div
                className={cn(
                  "rounded px-2 py-0.5",
                  "bg-slate-900 dark:bg-slate-800",
                  "font-mono text-xs font-bold tracking-wide text-white"
                )}
              >
                {vehicule.immatriculation}
              </div>

              {/* Fuel type badge */}
              {fuelConfig && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
                    fuelConfig.bgClass,
                    fuelConfig.textClass
                  )}
                >
                  <Fuel className="h-2.5 w-2.5" />
                  {fuelConfig.label}
                </span>
              )}
            </div>

            {/* Row 2: Brand/Model + Mileage */}
            <div className="flex items-center gap-3">
              <span className="truncate text-sm font-medium">
                {vehicule.marque || "Marque inconnue"} {vehicule.modele || ""}
              </span>

              {vehicule.kilometrage_actuel && (
                <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Gauge className="h-3 w-3" />
                  <span className="font-mono tabular-nums">
                    {vehicule.kilometrage_actuel.toLocaleString("fr-FR")} km
                  </span>
                </div>
              )}
            </div>

            {/* Row 3: Status badge */}
            <div className="flex items-center">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
                  statusConfig.badgeBg,
                  statusConfig.textClass
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.bgClass)} />
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 opacity-60 transition-opacity group-hover:opacity-100"
                >
                  <MoreVertical className="h-5 w-5" />
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

          {/* Hover hint */}
          <div
            className={cn(
              "flex shrink-0 items-center text-muted-foreground",
              "opacity-0 transition-opacity group-hover:opacity-100"
            )}
          >
            <ChevronRight className="h-4 w-4" />
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

// List wrapper with loading and empty states
interface VehiculeListProps {
  vehicules: Vehicule[];
  loading?: boolean;
}

export function VehiculeList({ vehicules, loading }: VehiculeListProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse border-b border-l-4 border-l-slate-300 bg-muted last:border-b-0"
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
    <div className="overflow-hidden rounded-lg border">
      {vehicules.map((vehicule, index) => (
        <VehiculeListItem key={vehicule.id} vehicule={vehicule} index={index} />
      ))}
    </div>
  );
}
