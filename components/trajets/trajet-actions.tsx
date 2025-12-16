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

  // Le bouton "Enregistrer le retour" n'est visible que si:
  // - Le trajet est en cours
  // - Le km_fin n'est pas encore renseigné (null ou 0)
  const canEnregistrerRetour = statut === "en_cours" && (!kmFin || kmFin === 0);

  const handleRetourSuccess = () => {
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      {canEnregistrerRetour && (
        <TrajetRetourDialog
          trajetId={trajetId}
          kmDebut={kmDebut}
          litragePrevu={litragePrevu}
          onSuccess={handleRetourSuccess}
        />
      )}

      <Button variant="outline" asChild>
        <Link href={`/trajets/${trajetId}/modifier`}>
          <Pencil className="mr-2 h-4 w-4" />
          Modifier
        </Link>
      </Button>

      <Button variant="destructive" asChild>
        <Link href={`/trajets/${trajetId}/supprimer`}>
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </Link>
      </Button>
    </div>
  );
}
