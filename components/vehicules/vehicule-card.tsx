/**
 * Composant Carte véhicule
 * Affiche un véhicule sous forme de carte
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Eye, Trash2, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Vehicule } from "@/lib/supabase/types";
import { VehiculeDeleteDialog } from "./vehicule-delete-dialog";
import { useState } from "react";

interface VehiculeCardProps {
  vehicule: Vehicule;
}

export function VehiculeCard({ vehicule }: VehiculeCardProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleCardClick = () => {
    router.push(`/vehicules/${vehicule.id}`);
  };

  return (
    <>
      <Card
        className="cursor-pointer transition-colors hover:bg-muted/50"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold">
            {vehicule.immatriculation}
          </CardTitle>
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11">
                  •••
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
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
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Ligne 1 : Marque/Modèle */}
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="text-base font-medium truncate">
                {vehicule.marque || "Marque inconnue"}{" "}
                {vehicule.modele || ""}
              </span>
            </div>

            {/* Ligne 2 : Statut */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Statut</span>
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
              >
                {vehicule.statut}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <VehiculeDeleteDialog
        vehicule={vehicule}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
