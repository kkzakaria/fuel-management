/**
 * Table des sous-traitants (Desktop)
 */

"use client";

import Link from "next/link";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { SousTraitant } from "@/lib/supabase/sous-traitant-types";
import { useState } from "react";
import { toast } from "sonner";
import { deleteSousTraitantAction } from "@/lib/actions/sous-traitants";

interface SousTraitantTableProps {
  sousTraitants: SousTraitant[];
  onDelete?: () => void;
}

export function SousTraitantTable({ sousTraitants, onDelete }: SousTraitantTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, nom: string) => {
    if (!confirm(`Supprimer ${nom} ?`)) return;

    try {
      setDeleting(id);
      const result = await deleteSousTraitantAction({ id });
      if (result?.serverError) throw new Error(result.serverError);
      toast.success("Sous-traitant supprimé");
      onDelete?.();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erreur suppression");
    } finally {
      setDeleting(null);
    }
  };

  const getStatutBadge = (statut: string | null) => {
    if (statut === "actif") return <Badge variant="default">Actif</Badge>;
    if (statut === "blackliste") return <Badge variant="destructive">Blacklisté</Badge>;
    return <Badge variant="secondary">Inactif</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entreprise</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sousTraitants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Aucun sous-traitant trouvé
              </TableCell>
            </TableRow>
          ) : (
            sousTraitants.map((st) => (
              <TableRow key={st.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">{st.nom_entreprise}</TableCell>
                <TableCell>{st.contact_principal || "-"}</TableCell>
                <TableCell>{st.telephone || "-"}</TableCell>
                <TableCell>{getStatutBadge(st.statut)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/sous-traitance/${st.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Détails
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/sous-traitance/${st.id}/modifier`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(st.id, st.nom_entreprise)}
                        disabled={deleting === st.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
