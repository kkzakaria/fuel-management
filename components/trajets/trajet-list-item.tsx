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
import { StatusBadge } from "@/components/ui/status-badge";
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
    if (!statut) return <StatusBadge variant="outline" className="text-sm">Inconnu</StatusBadge>;

    const variants: Record<string, "success" | "info" | "destructive"> = {
      en_cours: "info",
      termine: "success",
      annule: "destructive",
    };

    const labels: Record<string, string> = {
      en_cours: "En cours",
      termine: "Terminé",
      annule: "Annulé",
    };

    return (
      <StatusBadge variant={variants[statut] || "info"} className="text-sm">
        {labels[statut] || statut}
      </StatusBadge>
    );
  };

  return (
    <>
      <div
        className="flex items-center gap-3 p-3 border-b hover:bg-muted/50 active:bg-muted cursor-pointer transition-all duration-200 active:scale-[0.98]"
        onClick={handleClick}
      >
        {/* Contenu principal */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Ligne 1 : Numéro + Date */}
          <div className="flex items-center gap-2">
            <span className="text-base font-mono font-semibold text-primary">
              {trajet.numero_trajet}
            </span>
            <span className="text-sm text-muted-foreground">
              {format(new Date(trajet.date_trajet), "dd MMM yyyy", { locale: fr })}
            </span>
          </div>

          {/* Ligne 2 : Trajet */}
          <div className="text-base font-medium truncate">
            {trajet.localite_depart?.nom || "Départ"} → {trajet.localite_arrivee?.nom || "Arrivée"}
          </div>

          {/* Ligne 3 : Statut + Alerte */}
          <div className="flex items-center gap-2">
            {getStatutBadge(trajet.statut)}
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
