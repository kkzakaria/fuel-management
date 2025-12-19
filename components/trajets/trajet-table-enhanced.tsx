/**
 * Enhanced Trajet Table - Industrial Design
 *
 * Desktop table with:
 * - Visual row grouping by status
 * - Monospace trip numbers
 * - Route visualization in cells
 * - Fuel alert indicators
 * - Hover effects with warm amber accent
 */

"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowRight,
  AlertTriangle,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  TruckIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";
import { TrajetDeleteDialog } from "./trajet-delete-dialog";
import { TrajetRetourDialog } from "./trajet-retour-dialog";
import type { TrajetListItem } from "./trajet-table";

// Status configuration
const STATUS_CONFIG = {
  en_cours: {
    label: "En cours",
    dotClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    rowHover: "hover:bg-amber-50/50 dark:hover:bg-amber-950/20",
  },
  termine: {
    label: "Terminé",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    rowHover: "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20",
  },
  annule: {
    label: "Annulé",
    dotClass: "bg-slate-400",
    textClass: "text-slate-500 dark:text-slate-400",
    rowHover: "hover:bg-slate-50/50 dark:hover:bg-slate-800/20",
  },
} as const;

// Row actions component
function TrajetRowActions({ trajet }: { trajet: TrajetListItem }) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [retourDialogOpen, setRetourDialogOpen] = useState(false);
  const { canEditTrips, canDeleteTrips, canRegisterReturn, loading } = useUserRole();

  const showEnregistrerRetour =
    canRegisterReturn &&
    trajet.statut === "en_cours" &&
    (!trajet.km_fin || trajet.km_fin === 0);

  const handleRetourSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
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

          {showEnregistrerRetour && !loading && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setRetourDialogOpen(true);
              }}
            >
              <TruckIcon className="mr-2 h-4 w-4" />
              Enregistrer le retour
            </DropdownMenuItem>
          )}

          {canEditTrips && !loading && (
            <DropdownMenuItem asChild>
              <Link href={`/trajets/${trajet.id}/modifier`}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </DropdownMenuItem>
          )}

          {canDeleteTrips && !loading && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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

      {canDeleteTrips && (
        <TrajetDeleteDialog
          trajetId={trajet.id}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </>
  );
}

interface TrajetTableEnhancedProps {
  trajets: TrajetListItem[];
  loading?: boolean;
}

export function TrajetTableEnhanced({ trajets, loading }: TrajetTableEnhancedProps) {
  const router = useRouter();

  const handleRowClick = (trajetId: string) => {
    router.push(`/trajets/${trajetId}`);
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[130px]">N° Trajet</TableHead>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead className="w-[160px]">Chauffeur</TableHead>
              <TableHead className="w-[130px]">Véhicule</TableHead>
              <TableHead className="min-w-[200px]">Itinéraire</TableHead>
              <TableHead className="w-[90px] text-right">Distance</TableHead>
              <TableHead className="w-[120px] text-right">Carburant</TableHead>
              <TableHead className="w-[100px]">Statut</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(8)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={9}>
                  <Skeleton className="h-10 w-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (trajets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card px-4 py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <TruckIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">Aucun trajet trouvé</h3>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Aucun trajet ne correspond à vos critères de recherche. Essayez de modifier vos
          filtres.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b-2">
            <TableHead className="w-[130px] font-semibold">N° Trajet</TableHead>
            <TableHead className="w-[100px] font-semibold">Date</TableHead>
            <TableHead className="w-[160px] font-semibold">Chauffeur</TableHead>
            <TableHead className="w-[130px] font-semibold">Véhicule</TableHead>
            <TableHead className="min-w-[200px] font-semibold">Itinéraire</TableHead>
            <TableHead className="w-[90px] text-right font-semibold">Distance</TableHead>
            <TableHead className="w-[120px] text-right font-semibold">Carburant</TableHead>
            <TableHead className="w-[100px] font-semibold">Statut</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trajets.map((trajet, index) => {
            const statusConfig =
              STATUS_CONFIG[(trajet.statut as keyof typeof STATUS_CONFIG) || "en_cours"] ||
              STATUS_CONFIG.en_cours;

            // Check for fuel alerts
            const hasEcartAlert =
              trajet.ecart_litrage && Math.abs(trajet.ecart_litrage) > 10;
            const hasConsommationAlert =
              trajet.consommation_au_100 && trajet.consommation_au_100 > 40;
            const hasAlert = hasEcartAlert || hasConsommationAlert;

            return (
              <TableRow
                key={trajet.id}
                onClick={() => handleRowClick(trajet.id)}
                className={cn(
                  "group cursor-pointer transition-colors",
                  statusConfig.rowHover,
                  "animate-fade-in opacity-0"
                )}
                style={{ animationDelay: `${index * 20}ms` }}
              >
                {/* Trip Number */}
                <TableCell>
                  <span
                    className={cn(
                      "inline-block rounded-md px-2 py-0.5",
                      "bg-slate-900 dark:bg-slate-800",
                      "font-mono text-xs font-bold tracking-wide text-white"
                    )}
                  >
                    {trajet.numero_trajet}
                  </span>
                </TableCell>

                {/* Date */}
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(trajet.date_trajet), "dd MMM yy", { locale: fr })}
                </TableCell>

                {/* Driver */}
                <TableCell>
                  {trajet.chauffeur ? (
                    <span className="text-sm">
                      {trajet.chauffeur.prenom} {trajet.chauffeur.nom}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Vehicle */}
                <TableCell>
                  {trajet.vehicule ? (
                    <div>
                      <span className="font-mono text-xs font-medium">
                        {trajet.vehicule.immatriculation}
                      </span>
                      {trajet.vehicule.marque && (
                        <div className="text-xs text-muted-foreground">
                          {trajet.vehicule.marque}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Route */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm">
                      {trajet.localite_depart?.nom || "Départ"}
                    </span>
                    <ArrowRight
                      className={cn("h-3.5 w-3.5 shrink-0", statusConfig.textClass)}
                    />
                    <span className="truncate text-sm font-medium">
                      {trajet.localite_arrivee?.nom || "Arrivée"}
                    </span>
                  </div>
                  {trajet.localite_arrivee?.region && (
                    <div className="text-xs text-muted-foreground">
                      {trajet.localite_arrivee.region}
                    </div>
                  )}
                </TableCell>

                {/* Distance */}
                <TableCell className="text-right">
                  {trajet.parcours_total ? (
                    <span className="tabular-nums text-sm">{trajet.parcours_total} km</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Fuel */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {hasAlert && (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <div>
                      {trajet.litrage_station ? (
                        <span
                          className={cn(
                            "tabular-nums text-sm",
                            hasAlert && "font-medium text-red-600 dark:text-red-400"
                          )}
                        >
                          {trajet.litrage_station} L
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                      {trajet.consommation_au_100 && (
                        <div
                          className={cn(
                            "text-xs",
                            hasConsommationAlert
                              ? "text-red-500"
                              : "text-muted-foreground"
                          )}
                        >
                          {trajet.consommation_au_100.toFixed(1)} L/100
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
                      statusConfig.textClass
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.dotClass)} />
                    {statusConfig.label}
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <TrajetRowActions trajet={trajet} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
