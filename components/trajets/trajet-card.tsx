/**
 * Trajet Card Component - Industrial Design
 *
 * Bold, utilitarian card with:
 * - Edge status indicator (left border)
 * - Route visualization with arrow
 * - Monospace trip number
 * - Fuel alert badges
 * - Swipe-friendly for mobile
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Eye,
  Fuel,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  TruckIcon,
  User,
  Gauge,
  AlertTriangle,
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
import { useUserRole } from "@/hooks/use-user-role";
import { TrajetDeleteDialog } from "./trajet-delete-dialog";
import { TrajetRetourDialog } from "./trajet-retour-dialog";
import type { TrajetListItem } from "./trajet-table";

// Status configuration with industrial colors
const STATUS_CONFIG = {
  en_cours: {
    label: "En cours",
    borderClass: "border-l-amber-500",
    bgClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-50 dark:bg-amber-950/30",
  },
  termine: {
    label: "Terminé",
    borderClass: "border-l-emerald-500",
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  annule: {
    label: "Annulé",
    borderClass: "border-l-slate-400",
    bgClass: "bg-slate-400",
    textClass: "text-slate-500 dark:text-slate-400",
    badgeBg: "bg-slate-100 dark:bg-slate-800/30",
  },
} as const;

interface TrajetCardProps {
  trajet: TrajetListItem;
  index?: number;
}

export function TrajetCard({ trajet, index = 0 }: TrajetCardProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [retourDialogOpen, setRetourDialogOpen] = useState(false);
  const {
    canEditTrips,
    canDeleteTrips,
    canRegisterReturn,
    loading: roleLoading,
  } = useUserRole();

  const statusConfig =
    STATUS_CONFIG[(trajet.statut as keyof typeof STATUS_CONFIG) || "en_cours"] ||
    STATUS_CONFIG.en_cours;

  const showEnregistrerRetour =
    canRegisterReturn &&
    trajet.statut === "en_cours" &&
    (!trajet.km_fin || trajet.km_fin === 0);

  // Check for fuel alerts
  const hasEcartAlert = trajet.ecart_litrage && Math.abs(trajet.ecart_litrage) > 10;
  const hasConsommationAlert =
    trajet.consommation_au_100 && trajet.consommation_au_100 > 40;
  const hasAlert = hasEcartAlert || hasConsommationAlert;

  const handleClick = () => {
    router.push(`/trajets/${trajet.id}`);
  };

  const handleRetourSuccess = () => {
    router.refresh();
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
        {/* Alert indicator - top right corner */}
        {hasAlert && (
          <div className="absolute right-2 top-2 flex items-center gap-1">
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full",
                "bg-red-100 dark:bg-red-900/50"
              )}
            >
              <AlertTriangle className="h-3 w-3 text-red-500" />
            </span>
          </div>
        )}

        <div className="p-4">
          {/* Header: Trip number + Date + Actions */}
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Trip number - Industrial monospace style */}
              <div
                className={cn(
                  "rounded-lg px-2.5 py-1",
                  "bg-slate-900 dark:bg-slate-800",
                  "font-mono text-sm font-bold tracking-wide text-white"
                )}
              >
                {trajet.numero_trajet}
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {format(new Date(trajet.date_trajet), "dd MMM", { locale: fr })}
                </span>
              </div>
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
                    <Link href={`/trajets/${trajet.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détails
                    </Link>
                  </DropdownMenuItem>

                  {showEnregistrerRetour && !roleLoading && (
                    <DropdownMenuItem onClick={() => setRetourDialogOpen(true)}>
                      <TruckIcon className="mr-2 h-4 w-4" />
                      Enregistrer le retour
                    </DropdownMenuItem>
                  )}

                  {canEditTrips && !roleLoading && (
                    <DropdownMenuItem asChild>
                      <Link href={`/trajets/${trajet.id}/modifier`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {canDeleteTrips && !roleLoading && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Route visualization */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              {/* Departure */}
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    "bg-slate-100 dark:bg-slate-800"
                  )}
                >
                  <MapPin className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                </div>
                <span className="truncate font-medium">
                  {trajet.localite_depart?.nom || "Départ"}
                </span>
              </div>

              {/* Arrow */}
              <div className="flex shrink-0 items-center px-2">
                <ArrowRight className={cn("h-4 w-4", statusConfig.textClass)} />
              </div>

              {/* Arrival */}
              <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                <span className="truncate text-right font-medium">
                  {trajet.localite_arrivee?.nom || "Arrivée"}
                </span>
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    statusConfig.badgeBg
                  )}
                >
                  <MapPin className={cn("h-3.5 w-3.5", statusConfig.textClass)} />
                </div>
              </div>
            </div>

            {/* Region subtitle */}
            {trajet.localite_arrivee?.region && (
              <p className="mt-1 text-center text-xs text-muted-foreground">
                {trajet.localite_arrivee.region}
              </p>
            )}
          </div>

          {/* Info row: Driver + Vehicle + Distance */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-dashed border-border/50 pt-3 text-sm">
            {/* Driver */}
            {trajet.chauffeur && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span className="truncate">
                  {trajet.chauffeur.prenom} {trajet.chauffeur.nom?.charAt(0)}.
                </span>
              </div>
            )}

            {/* Vehicle */}
            {trajet.vehicule && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TruckIcon className="h-3.5 w-3.5" />
                <span className="font-mono text-xs">
                  {trajet.vehicule.immatriculation}
                </span>
              </div>
            )}

            {/* Distance */}
            {trajet.parcours_total && trajet.parcours_total > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Gauge className="h-3.5 w-3.5" />
                <span className="tabular-nums">{trajet.parcours_total} km</span>
              </div>
            )}

            {/* Fuel with alert */}
            {trajet.litrage_station && (
              <div
                className={cn(
                  "flex items-center gap-1.5",
                  hasAlert
                    ? "font-medium text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
                )}
              >
                <Fuel className="h-3.5 w-3.5" />
                <span className="tabular-nums">{trajet.litrage_station} L</span>
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

      {/* Dialogs */}
      {showEnregistrerRetour && (
        <TrajetRetourDialog
          trajetId={trajet.id}
          kmDebut={trajet.km_debut}
          litragePrevu={trajet.litrage_prevu}
          onSuccess={handleRetourSuccess}
          open={retourDialogOpen}
          onOpenChange={setRetourDialogOpen}
        />
      )}

      <TrajetDeleteDialog
        trajetId={trajet.id}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}

// Grid wrapper for tablet view
interface TrajetCardGridProps {
  trajets: TrajetListItem[];
  loading?: boolean;
}

export function TrajetCardGrid({ trajets, loading }: TrajetCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-xl bg-muted"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  if (trajets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <TruckIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">Aucun trajet trouvé</h3>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Aucun trajet ne correspond à vos critères de recherche. Essayez de modifier
          vos filtres.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {trajets.map((trajet, index) => (
        <TrajetCard key={trajet.id} trajet={trajet} index={index} />
      ))}
    </div>
  );
}

// Mobile list wrapper with infinite scroll support
interface TrajetCardListProps {
  trajets: TrajetListItem[];
  loading?: boolean;
}

export function TrajetCardList({ trajets, loading }: TrajetCardListProps) {
  if (loading && trajets.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl bg-muted"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  if (trajets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <TruckIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">Aucun trajet trouvé</h3>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Aucun trajet ne correspond à vos critères de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trajets.map((trajet, index) => (
        <TrajetCard key={trajet.id} trajet={trajet} index={index} />
      ))}
    </div>
  );
}
