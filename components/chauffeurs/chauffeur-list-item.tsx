/**
 * Composant Item de liste pour chauffeur (optimisé mobile)
 * Format liste compacte pour petits écrans
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Eye, Edit, Trash2, Phone, IdCard } from "lucide-react";
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
import type { Chauffeur } from "@/lib/supabase/types";
import { ChauffeurDeleteDialog } from "./chauffeur-delete-dialog";

interface ChauffeurListItemProps {
  chauffeur: Chauffeur;
}

export function ChauffeurListItem({ chauffeur }: ChauffeurListItemProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleClick = () => {
    router.push(`/chauffeurs/${chauffeur.id}`);
  };

  // Initiales pour l'avatar
  const initiales = `${chauffeur.prenom?.charAt(0) || ""}${chauffeur.nom?.charAt(0) || ""}`.toUpperCase();

  return (
    <>
      <div
        className="flex items-center gap-3 p-4 border-b hover:bg-muted/50 active:bg-muted cursor-pointer transition-all duration-200 active:scale-[0.98]"
        onClick={handleClick}
      >
        {/* Avatar */}
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initiales}
          </AvatarFallback>
        </Avatar>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Ligne 1 : Nom + Statut */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-semibold truncate">
              {chauffeur.prenom} {chauffeur.nom}
            </span>
            <Badge
              variant={
                chauffeur.statut === "actif"
                  ? "default"
                  : chauffeur.statut === "inactif"
                    ? "secondary"
                    : "destructive"
              }
              className="text-sm shrink-0"
            >
              {chauffeur.statut}
            </Badge>
          </div>

          {/* Ligne 2 : Téléphone */}
          {chauffeur.telephone && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{chauffeur.telephone}</span>
            </div>
          )}

          {/* Ligne 3 : N° Permis + Date embauche */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {chauffeur.numero_permis && (
              <>
                <div className="flex items-center gap-1.5">
                  <IdCard className="h-3 w-3" />
                  <span>{chauffeur.numero_permis}</span>
                </div>
                {chauffeur.date_embauche && <span>•</span>}
              </>
            )}
            {chauffeur.date_embauche && (
              <span>
                Depuis {new Date(chauffeur.date_embauche).toLocaleDateString("fr-FR", {
                  month: "short",
                  year: "numeric"
                })}
              </span>
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
                <Link href={`/chauffeurs/${chauffeur.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/chauffeurs/${chauffeur.id}/modifier`}>
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

      <ChauffeurDeleteDialog
        chauffeur={chauffeur}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
