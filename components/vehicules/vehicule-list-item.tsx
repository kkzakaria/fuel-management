/**
 * Composant Item de liste pour véhicule (optimisé mobile)
 * Format liste compacte pour petits écrans
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Eye, Edit, Trash2, Truck, Gauge, Fuel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface VehiculeListItemProps {
  vehicule: Vehicule;
}

export function VehiculeListItem({ vehicule }: VehiculeListItemProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleClick = () => {
    router.push(`/vehicules/${vehicule.id}`);
  };

  return (
    <>
      <div
        className="flex items-center gap-3 p-4 border-b hover:bg-muted/50 active:bg-muted cursor-pointer transition-all duration-200 active:scale-[0.98]"
        onClick={handleClick}
      >
        {/* Icône véhicule */}
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Truck className="h-6 w-6 text-primary" />
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Ligne 1 : Immatriculation + Statut */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-bold truncate">
              {vehicule.immatriculation}
            </span>
            <Badge
              variant={
                vehicule.statut === "actif"
                  ? "default"
                  : vehicule.statut === "maintenance"
                    ? "secondary"
                    : vehicule.statut === "inactif"
                      ? "outline"
                      : "destructive"
              }
              className="text-sm shrink-0"
            >
              {vehicule.statut}
            </Badge>
          </div>

          {/* Ligne 2 : Marque/Modèle + Année */}
          <div className="text-sm text-muted-foreground truncate">
            {vehicule.marque || "Marque inconnue"} {vehicule.modele || ""}{" "}
            {vehicule.annee && `(${vehicule.annee})`}
          </div>

          {/* Ligne 3 : Métriques */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {vehicule.type_carburant && (
              <div className="flex items-center gap-1">
                <Fuel className="h-3 w-3" />
                <span>{vehicule.type_carburant}</span>
              </div>
            )}
            {vehicule.type_carburant && vehicule.kilometrage_actuel != null && <span>•</span>}
            {vehicule.kilometrage_actuel != null && (
              <div className="flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                <span className="font-semibold text-foreground">{vehicule.kilometrage_actuel.toLocaleString("fr-FR")}</span>
                <span>km</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11">
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
                className="text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
