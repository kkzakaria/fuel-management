/**
 * Composant Item de liste pour trajet (optimisé mobile)
 * Format liste compacte pour petits écrans
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronRight, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrajetAlertBadge } from "./trajet-alert-badge";
import { TrajetDeleteDialog } from "./trajet-delete-dialog";
import type { TrajetListItem } from "./trajet-table";

interface TrajetListItemProps {
  trajet: TrajetListItem;
}

export function TrajetListItemComponent({ trajet }: TrajetListItemProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleClick = () => {
    router.push(`/trajets/${trajet.id}`);
  };

  const getStatutBadge = (statut: string | null) => {
    if (!statut) return <Badge variant="outline" className="text-sm">Inconnu</Badge>;

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
      <Badge variant={variants[statut] || "default"} className="text-sm">
        {labels[statut] || statut}
      </Badge>
    );
  };

  return (
    <>
      <div
        className="flex items-center gap-3 p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={handleClick}
      >
        {/* Contenu principal */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Ligne 1 : Date + Statut */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {format(new Date(trajet.date_trajet), "dd MMM yyyy", { locale: fr })}
            </span>
            {getStatutBadge(trajet.statut)}
          </div>

          {/* Ligne 2 : Trajet */}
          <div className="text-base font-semibold truncate">
            {trajet.localite_depart?.nom || "Départ"} → {trajet.localite_arrivee?.nom || "Arrivée"}
          </div>

          {/* Ligne 3 : Chauffeur + Véhicule */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="truncate">
              {trajet.chauffeur
                ? `${trajet.chauffeur.prenom} ${trajet.chauffeur.nom}`
                : "Non assigné"}
            </span>
            <span>•</span>
            <span className="truncate">
              {trajet.vehicule?.immatriculation || "Non assigné"}
            </span>
          </div>

          {/* Ligne 4 : Métriques */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">{trajet.parcours_total}</span> km
            </span>
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">{trajet.litrage_station || "-"}</span> L
            </span>
            {trajet.consommation_au_100 && (
              <span className="text-muted-foreground">
                {trajet.consommation_au_100.toFixed(1)} L/100km
              </span>
            )}
            <TrajetAlertBadge
              trajet={{
                ecart_litrage: trajet.ecart_litrage ?? null,
                consommation_au_100: trajet.consommation_au_100 ?? null,
                litrage_station: trajet.litrage_station ?? null,
                prix_litre: trajet.prix_litre ?? null,
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11">
                <ChevronRight className="h-5 w-5" />
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
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TrajetDeleteDialog
        trajetId={trajet.id}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
