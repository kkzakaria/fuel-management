/**
 * Composant Dialog de suppression de véhicule
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
import { deleteVehiculeAction } from "@/lib/actions/vehicules";
import type { Vehicule } from "@/lib/supabase/types";

interface VehiculeDeleteDialogProps {
  vehicule: Vehicule;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VehiculeDeleteDialog({
  vehicule,
  open,
  onOpenChange,
}: VehiculeDeleteDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const result = await deleteVehiculeAction({ vehicule_id: vehicule.id });

      if (result?.data?.success) {
        toast.success(result.data.message || "Véhicule supprimé avec succès");
        onOpenChange(false);
        router.refresh();
      } else {
        throw new Error(result?.serverError || "Erreur lors de la suppression");
      }
    } catch (error: unknown) {
      console.error("Erreur suppression véhicule:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression du véhicule"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le véhicule ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le véhicule{" "}
            <span className="font-semibold">{vehicule.immatriculation}</span> ?
            <br />
            <br />
            <span className="text-destructive">
              Cette action est irréversible et supprimera définitivement ce
              véhicule.
            </span>
            <br />
            <br />
            Note : Si le véhicule a des trajets associés, il ne pourra pas être
            supprimé. Changez son statut en &quot;inactif&quot; ou
            &quot;vendu&quot; à la place.
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
