/**
 * Composant Item de liste pour sous-traitant (optimisé mobile)
 * Format liste compacte pour petits écrans
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Eye, Edit, Trash2, Phone, Mail, MapPin, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SousTraitantDeleteDialog } from "./sous-traitant-delete-dialog";
import type { Database } from "@/lib/supabase/database.types";

type SousTraitant = Database["public"]["Tables"]["sous_traitant"]["Row"];

interface SousTraitantListItemProps {
  sousTraitant: SousTraitant;
  onDelete?: () => void;
}

function getStatutBadgeVariant(
  statut: string
): "default" | "secondary" | "destructive" {
  switch (statut) {
    case "actif":
      return "default";
    case "inactif":
      return "secondary";
    case "blackliste":
      return "destructive";
    default:
      return "secondary";
  }
}

function getStatutLabel(statut: string): string {
  switch (statut) {
    case "actif":
      return "Actif";
    case "inactif":
      return "Inactif";
    case "blackliste":
      return "Blacklisté";
    default:
      return statut;
  }
}

export function SousTraitantListItem({
  sousTraitant,
  onDelete,
}: SousTraitantListItemProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleClick = () => {
    router.push(`/sous-traitance/${sousTraitant.id}`);
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
        {/* Icône entreprise */}
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Ligne 1 : Nom entreprise + Statut */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold truncate">
              {sousTraitant.nom_entreprise}
            </span>
            {sousTraitant.statut && (
              <Badge
                variant={getStatutBadgeVariant(sousTraitant.statut)}
                className="text-xs shrink-0"
              >
                {getStatutLabel(sousTraitant.statut)}
              </Badge>
            )}
          </div>

          {/* Ligne 2 : Contact principal */}
          {sousTraitant.contact_principal && (
            <div className="text-sm text-muted-foreground truncate">
              {sousTraitant.contact_principal}
            </div>
          )}

          {/* Ligne 3 : Téléphone + Email */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {sousTraitant.telephone && (
              <>
                <div className="flex items-center gap-1 truncate">
                  <Phone className="h-3 w-3 shrink-0" />
                  <span className="truncate">{sousTraitant.telephone}</span>
                </div>
                {sousTraitant.email && <span>•</span>}
              </>
            )}
            {sousTraitant.email && (
              <div className="flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{sousTraitant.email}</span>
              </div>
            )}
          </div>

          {/* Ligne 4 : Adresse */}
          {sousTraitant.adresse && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{sousTraitant.adresse}</span>
            </div>
          )}
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
                onClick={() => router.push(`/sous-traitance/${sousTraitant.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/sous-traitance/${sousTraitant.id}/modifier`)
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

      <SousTraitantDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        sousTraitant={sousTraitant}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
