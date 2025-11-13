/**
 * Composant Item de liste pour sous-traitant (optimisé mobile)
 * Format liste compacte pour petits écrans
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Eye, Edit, Trash2, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { SousTraitant } from "@/lib/supabase/sous-traitant-types";
import { SousTraitantDeleteDialog } from "./sous-traitant-delete-dialog";

interface SousTraitantListItemProps {
  sousTraitant: SousTraitant;
  onDelete?: () => void;
}

export function SousTraitantListItem({ sousTraitant }: SousTraitantListItemProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleClick = () => {
    router.push(`/sous-traitance/${sousTraitant.id}`);
  };

  // Initiales pour l'avatar (première lettre de chaque mot)
  const initiales = sousTraitant.nom_entreprise
    .split(" ")
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <>
      <div
        className="flex items-center gap-3 p-3 border-b hover:bg-muted/50 active:bg-muted cursor-pointer transition-all duration-200 active:scale-[0.98]"
        onClick={handleClick}
      >
        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {initiales}
          </AvatarFallback>
        </Avatar>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Ligne 1 : Nom + Statut */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-semibold truncate">
              {sousTraitant.nom_entreprise}
            </span>
            <Badge
              variant={
                sousTraitant.statut === "actif"
                  ? "default"
                  : sousTraitant.statut === "blackliste"
                    ? "destructive"
                    : "secondary"
              }
              className="text-sm shrink-0"
            >
              {sousTraitant.statut === "actif" ? "Actif" : sousTraitant.statut === "blackliste" ? "Blacklisté" : "Inactif"}
            </Badge>
          </div>

          {/* Ligne 2 : Téléphone */}
          {sousTraitant.telephone && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{sousTraitant.telephone}</span>
            </div>
          )}
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
                <Link href={`/sous-traitance/${sousTraitant.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/sous-traitance/${sousTraitant.id}/modifier`}>
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

      <SousTraitantDeleteDialog
        sousTraitant={sousTraitant}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
