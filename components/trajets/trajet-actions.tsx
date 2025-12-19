/**
 * Actions disponibles pour un trajet
 * Composant client pour gérer les dialogs et interactions
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrajetRetourDialog } from "./trajet-retour-dialog";
import { TrajetEditDialog } from "./trajet-edit-dialog";
import { useUserRole } from "@/hooks/use-user-role";
import type { Trajet } from "@/lib/supabase/types";

// Type for the trajet data - handles both API response (conteneurs) and direct query (conteneur_trajet)
interface TrajetWithRelations extends Trajet {
  conteneur_trajet?: Array<{
    id?: string;
    type_conteneur_id: string;
    numero_conteneur?: string | null;
    quantite?: number;
    statut_livraison?: string | null;
  }>;
  conteneurs?: Array<{
    id?: string;
    type_conteneur_id: string;
    numero_conteneur?: string | null;
    quantite?: number;
    statut_livraison?: string | null;
  }>;
}

interface TrajetActionsProps {
  trajet: TrajetWithRelations;
}

export function TrajetActions({ trajet }: TrajetActionsProps) {
  const router = useRouter();
  const { canEditTrips, canDeleteTrips, canRegisterReturn, loading } = useUserRole();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { id: trajetId, statut, km_debut: kmDebut, km_fin: kmFin, litrage_prevu: litragePrevu } = trajet;

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

  const handleEditSuccess = () => {
    router.refresh();
  };

  // Si l'utilisateur n'a aucune permission d'action, ne rien afficher
  if (!canEditTrips && !canDeleteTrips && !showEnregistrerRetour) {
    return null;
  }

  return (
    <>
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
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
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

      {/* Edit Dialog */}
      <TrajetEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        trajet={trajet}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
