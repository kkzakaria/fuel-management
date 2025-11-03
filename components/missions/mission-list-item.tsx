/**
 * Composant Item de liste pour mission (optimisé mobile)
 * Format liste compacte pour petits écrans
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Eye, Edit, Trash2, Package, MapPin, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MissionDeleteDialog } from "./mission-delete-dialog";
import { formatCurrency } from "@/lib/format-utils";
import { formatDate } from "@/lib/date-utils";

interface Mission {
  id: string;
  date_mission: string;
  montant_total: number | string;
  avance_payee: boolean | null;
  solde_paye: boolean | null;
  statut: string | null;
  quantite: number | null;
  numero_conteneur?: string | null;
  sous_traitant?: { id: string; nom_entreprise: string } | null;
  localite_depart?: { id: string; nom: string } | null;
  localite_arrivee?: { id: string; nom: string } | null;
  type_conteneur?: { id: string; nom: string; taille_pieds: number } | null;
  statut_paiement?: "en_attente" | "partiel" | "complet";
}

interface MissionListItemProps {
  mission: Mission;
  onDelete?: () => void;
}

function getStatutBadgeVariant(
  statut: string
): "default" | "secondary" | "destructive" {
  switch (statut) {
    case "en_cours":
      return "default";
    case "terminee":
      return "secondary";
    case "annulee":
      return "destructive";
    default:
      return "secondary";
  }
}

function getStatutLabel(statut: string): string {
  switch (statut) {
    case "en_cours":
      return "En cours";
    case "terminee":
      return "Terminée";
    case "annulee":
      return "Annulée";
    default:
      return statut;
  }
}

function getPaymentBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" {
  switch (status) {
    case "complet":
      return "default";
    case "partiel":
      return "secondary";
    case "en_attente":
      return "destructive";
    default:
      return "secondary";
  }
}

function getPaymentLabel(status: string): string {
  switch (status) {
    case "complet":
      return "Payé";
    case "partiel":
      return "Partiel";
    case "en_attente":
      return "En attente";
    default:
      return status;
  }
}

export function MissionListItem({ mission, onDelete }: MissionListItemProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleClick = () => {
    router.push(`/sous-traitance/missions/${mission.id}`);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <>
      <div
        className="flex items-center gap-3 p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={handleClick}
      >
        {/* Icône mission */}
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Package className="h-6 w-6 text-primary" />
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Ligne 1 : Date + Montant */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {formatDate(new Date(mission.date_mission))}
            </span>
            <span className="text-sm font-bold shrink-0">
              {formatCurrency(Number(mission.montant_total))}
            </span>
          </div>

          {/* Ligne 2 : Sous-traitant */}
          <div className="flex items-center gap-1.5 text-sm font-semibold truncate">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {mission.sous_traitant?.nom_entreprise || "Non assigné"}
            </span>
          </div>

          {/* Ligne 3 : Trajet */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {mission.localite_depart?.nom} → {mission.localite_arrivee?.nom}
            </span>
          </div>

          {/* Ligne 4 : Conteneur + Badges */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
              <span className="font-medium">{mission.type_conteneur?.nom}</span>
              {mission.quantite && (
                <>
                  <span>•</span>
                  <span>Qté: {mission.quantite}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {mission.statut_paiement && (
                <Badge
                  variant={getPaymentBadgeVariant(mission.statut_paiement)}
                  className="text-xs"
                >
                  {getPaymentLabel(mission.statut_paiement)}
                </Badge>
              )}
              {mission.statut && (
                <Badge
                  variant={getStatutBadgeVariant(mission.statut)}
                  className="text-xs"
                >
                  {getStatutLabel(mission.statut)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/sous-traitance/missions/${mission.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/sous-traitance/missions/${mission.id}/modifier`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
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

      <MissionDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        mission={mission}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
