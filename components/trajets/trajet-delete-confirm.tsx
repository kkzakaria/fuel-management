/**
 * Composant de confirmation de suppression d'un trajet
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle, ChevronLeft, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteTrajetAction } from "@/lib/actions/trajets";
import { toast } from "sonner";

interface TrajetDeleteConfirmProps {
  trajetId: string;
  numeroTrajet: string | null;
  localiteDepart: string;
  localiteArrivee: string;
  dateTrajet: string | null;
}

export function TrajetDeleteConfirm({
  trajetId,
  numeroTrajet,
  localiteDepart,
  localiteArrivee,
  dateTrajet,
}: TrajetDeleteConfirmProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteTrajetAction({ trajetId });

      if (result.data?.success) {
        toast.success(result.data.message || "Trajet supprimé avec succès");
        router.push("/trajets");
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
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/trajets/${trajetId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour au trajet
          </Link>
        </Button>
      </div>

      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle>Confirmer la suppression</CardTitle>
          </div>
          <CardDescription>
            Cette action est irréversible. Le trajet et toutes ses données associées seront
            définitivement supprimés.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">N° Trajet:</span>
              <span className="font-medium">{numeroTrajet || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Itinéraire:</span>
              <span className="font-medium">
                {localiteDepart} → {localiteArrivee}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">
                {dateTrajet
                  ? format(new Date(dateTrajet), "dd MMMM yyyy", { locale: fr })
                  : "-"}
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Les conteneurs et frais associés à ce trajet seront également supprimés.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" asChild disabled={isDeleting}>
            <Link href={`/trajets/${trajetId}`}>Annuler</Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Supprimer définitivement
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
