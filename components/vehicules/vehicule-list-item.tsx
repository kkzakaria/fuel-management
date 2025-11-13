/**
 * Composant Item de liste pour véhicule (optimisé mobile)
 * Format liste compacte pour petits écrans
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Eye, Edit, Trash2, Truck } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
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
        className="flex items-center gap-3 p-3 border-b hover:bg-muted/50 active:bg-muted cursor-pointer transition-all duration-200 active:scale-[0.98]"
        onClick={handleClick}
      >
        {/* Icône véhicule */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Truck className="h-5 w-5 text-primary" />
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Ligne 1 : Immatriculation + Statut */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-bold truncate">
              {vehicule.immatriculation}
            </span>
            <StatusBadge
              variant={
                vehicule.statut === "actif"
                  ? "success"
                  : vehicule.statut === "maintenance"
                    ? "secondary"
                    : vehicule.statut === "inactif"
                      ? "outline"
                      : "destructive"
              }
              className="text-sm shrink-0"
            >
              {vehicule.statut}
            </StatusBadge>
          </div>

          {/* Ligne 2 : Marque/Modèle */}
          <div className="text-base font-medium truncate">
            {vehicule.marque || "Marque inconnue"} {vehicule.modele || ""}
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
