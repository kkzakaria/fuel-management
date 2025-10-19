/**
 * Dialogue de confirmation de suppression d'un trajet
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
import { deleteTrajetAction } from "@/lib/actions/trajets";
import { toast } from "sonner";

interface TrajetDeleteDialogProps {
  trajetId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrajetDeleteDialog({
  trajetId,
  open,
  onOpenChange,
}: TrajetDeleteDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!trajetId) return;

    setIsDeleting(true);
    try {
      const result = await deleteTrajetAction({ trajetId });

      if (result.data?.success) {
        toast.success(result.data.message || "Trajet supprimé avec succès");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error("Erreur lors de la suppression du trajet");
      }
    } catch (error) {
      console.error("Erreur suppression trajet:", error);
      toast.error("Erreur lors de la suppression du trajet");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer ce trajet ? Cette action est
            irréversible et supprimera également tous les conteneurs associés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
