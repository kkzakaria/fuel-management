/**
 * Table des trajets avec tri, pagination et actions
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Pencil, Trash2, MoreVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { TrajetAlertBadge } from "./trajet-alert-badge";
import { TrajetDeleteDialog } from "./trajet-delete-dialog";

interface TrajetTableProps {
  trajets: any[];
  loading?: boolean;
}

export function TrajetTable({ trajets, loading }: TrajetTableProps) {
  const [trajetToDelete, setTrajetToDelete] = useState<string | null>(null);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "-";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatutBadge = (statut: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      en_cours: "secondary",
      termine: "default",
      annule: "destructive",
    };

    const labels: Record<string, string> = {
      en_cours: "En cours",
      termine: "Terminé",
      annule: "Annulé",
    };

    return (
      <Badge variant={variants[statut] || "default"}>
        {labels[statut] || statut}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Chauffeur</TableHead>
              <TableHead>Véhicule</TableHead>
              <TableHead>Trajet</TableHead>
              <TableHead className="text-right">Distance</TableHead>
              <TableHead className="text-right">Carburant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={8} className="h-16 text-center">
                  <div className="animate-pulse">Chargement...</div>
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
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Aucun trajet trouvé</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Chauffeur</TableHead>
              <TableHead>Véhicule</TableHead>
              <TableHead>Trajet</TableHead>
              <TableHead className="text-right">Distance</TableHead>
              <TableHead className="text-right">Carburant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trajets.map((trajet) => (
              <TableRow key={trajet.id}>
                <TableCell>
                  {format(new Date(trajet.date_trajet), "dd MMM yyyy", { locale: fr })}
                </TableCell>
                <TableCell>
                  {trajet.chauffeur
                    ? `${trajet.chauffeur.prenom} ${trajet.chauffeur.nom}`
                    : "-"}
                </TableCell>
                <TableCell>
                  {trajet.vehicule
                    ? `${trajet.vehicule.immatriculation}`
                    : "-"}
                  {trajet.vehicule?.marque && (
                    <div className="text-xs text-muted-foreground">
                      {trajet.vehicule.marque} {trajet.vehicule.modele}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <div className="text-sm">
                      {trajet.localite_depart?.nom} → {trajet.localite_arrivee?.nom}
                    </div>
                    {trajet.localite_arrivee?.region && (
                      <div className="text-xs text-muted-foreground">
                        {trajet.localite_arrivee.region}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {trajet.parcours_total} km
                </TableCell>
                <TableCell className="text-right">
                  <div>{trajet.litrage_station || "-"} L</div>
                  {trajet.consommation_au_100 && (
                    <div className="text-xs text-muted-foreground">
                      {trajet.consommation_au_100.toFixed(1)} L/100km
                    </div>
                  )}
                  <TrajetAlertBadge trajet={trajet} />
                </TableCell>
                <TableCell>{getStatutBadge(trajet.statut)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/trajets/${trajet.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/trajets/${trajet.id}/modifier`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setTrajetToDelete(trajet.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TrajetDeleteDialog
        trajetId={trajetToDelete}
        open={trajetToDelete !== null}
        onOpenChange={(open) => !open && setTrajetToDelete(null)}
      />
    </>
  );
}
