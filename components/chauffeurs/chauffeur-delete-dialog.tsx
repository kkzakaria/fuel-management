/**
 * Composant Dialog de suppression de chauffeur
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteChauffeurAction } from "@/lib/actions/chauffeurs";
import type { Chauffeur } from "@/lib/supabase/types";

interface ChauffeurDeleteDialogProps {
  chauffeur: Chauffeur;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChauffeurDeleteDialog({
  chauffeur,
  open,
  onOpenChange,
}: ChauffeurDeleteDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const result = await deleteChauffeurAction({ chauffeur_id: chauffeur.id });

      if (result?.data?.success) {
        toast.success(result.data.message || "Chauffeur supprimé avec succès");
        onOpenChange(false);
        router.refresh();
      } else {
        throw new Error(result?.serverError || "Erreur lors de la suppression");
      }
    } catch (error: unknown) {
      console.error("Erreur suppression chauffeur:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression du chauffeur"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le chauffeur ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer{" "}
            <span className="font-semibold">
              {chauffeur.prenom} {chauffeur.nom}
            </span>{" "}
            ?<br />
            <br />
            <span className="text-destructive">
              Cette action est irréversible et supprimera définitivement ce
              chauffeur.
            </span>
            <br />
            <br />
            Note : Si le chauffeur a des trajets associés, il ne pourra pas être
            supprimé. Changez son statut en &quot;inactif&quot; à la place.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
