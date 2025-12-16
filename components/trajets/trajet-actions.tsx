/**
 * Actions disponibles pour un trajet
 * Composant client pour gérer les dialogs et interactions
 */

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrajetRetourDialog } from "./trajet-retour-dialog";
import { useUserRole } from "@/hooks/use-user-role";

interface TrajetActionsProps {
  trajetId: string;
  statut: string | null;
  kmDebut: number;
  kmFin: number | null;
  litragePrevu?: number | null;
}

export function TrajetActions({
  trajetId,
  statut,
  kmDebut,
  kmFin,
  litragePrevu,
}: TrajetActionsProps) {
  const router = useRouter();
  const { canEditTrips, canDeleteTrips, canRegisterReturn, loading } = useUserRole();

  // Le bouton "Enregistrer le retour" n'est visible que si:
  // - L'utilisateur a la permission (admin, gestionnaire, chauffeur)
  // - Le trajet est en cours
  // - Le km_fin n'est pas encore renseigné (null ou 0)
  const showEnregistrerRetour = canRegisterReturn && statut === "en_cours" && (!kmFin || kmFin === 0);

  // Ne rien afficher pendant le chargement des permissions
  if (loading) {
    return null;
  }

  const handleRetourSuccess = () => {
    router.refresh();
  };

  // Si l'utilisateur n'a aucune permission d'action, ne rien afficher
  if (!canEditTrips && !canDeleteTrips && !showEnregistrerRetour) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {showEnregistrerRetour && (
        <TrajetRetourDialog
          trajetId={trajetId}
          kmDebut={kmDebut}
          litragePrevu={litragePrevu}
          onSuccess={handleRetourSuccess}
        />
      )}

      {canEditTrips && (
        <Button variant="outline" asChild>
          <Link href={`/trajets/${trajetId}/modifier`}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      )}

      {canDeleteTrips && (
        <Button variant="destructive" asChild>
          <Link href={`/trajets/${trajetId}/supprimer`}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Link>
        </Button>
      )}
    </div>
  );
}
