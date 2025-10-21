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
                <Button variant="ghost" size="sm">
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
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {vehicule.marque || "Marque inconnue"}{" "}
                {vehicule.modele || ""}
              </p>
              <p className="text-sm text-muted-foreground">
                {vehicule.annee || "Année inconnue"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type carburant</span>
              <Badge variant="outline">{vehicule.type_carburant || "N/A"}</Badge>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Kilométrage</span>
              <span className="font-medium">
                {(vehicule.kilometrage_actuel || 0).toLocaleString("fr-FR")} km
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Statut</span>
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
