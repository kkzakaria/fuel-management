/**
 * Composant Table des chauffeurs
 * Affiche la liste des chauffeurs avec actions
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Eye, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { Chauffeur } from "@/lib/supabase/types";
import { ChauffeurDeleteDialog } from "./chauffeur-delete-dialog";
import { useState } from "react";

interface ChauffeurTableProps {
  chauffeurs: Chauffeur[];
  loading?: boolean;
}

export function ChauffeurTable({ chauffeurs, loading }: ChauffeurTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChauffeur, setSelectedChauffeur] = useState<Chauffeur | null>(null);

  const handleDeleteClick = (chauffeur: Chauffeur) => {
    setSelectedChauffeur(chauffeur);
    setDeleteDialogOpen(true);
  };

  const handleRowClick = (chauffeurId: string) => {
    router.push(`/chauffeurs/${chauffeurId}`);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (chauffeurs.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <User className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Aucun chauffeur</h3>
        <p className="text-sm text-muted-foreground">
          Commencez par ajouter un nouveau chauffeur.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom complet</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>N° Permis</TableHead>
              <TableHead>Date embauche</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chauffeurs.map((chauffeur) => (
              <TableRow
                key={chauffeur.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(chauffeur.id)}
              >
                <TableCell className="font-medium">
                  {chauffeur.prenom} {chauffeur.nom}
                </TableCell>
                <TableCell>
                  {chauffeur.telephone || (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {chauffeur.numero_permis || (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {chauffeur.date_embauche ? (
                    new Date(chauffeur.date_embauche).toLocaleDateString("fr-FR")
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      chauffeur.statut === "actif"
                        ? "default"
                        : chauffeur.statut === "inactif"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {chauffeur.statut}
                  </Badge>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
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
                        onClick={() => handleDeleteClick(chauffeur)}
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

      {selectedChauffeur && (
        <ChauffeurDeleteDialog
          chauffeur={selectedChauffeur}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </>
  );
}
