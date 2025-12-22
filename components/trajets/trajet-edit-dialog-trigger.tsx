/**
 * Trigger component for TrajetEditDialog
 * Fetches full trajet data when dialog opens and renders the edit dialog
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrajetEditDialog } from "./trajet-edit-dialog";
import { fetchTrajetByIdClient } from "@/lib/supabase/trajet-queries-client";
import type { Trajet } from "@/lib/supabase/types";

interface ConteneurData {
  id?: string;
  type_conteneur_id: string;
  numero_conteneur?: string | null;
  quantite?: number;
  statut_livraison?: string | null;
}

interface TrajetData extends Trajet {
  conteneur_trajet?: ConteneurData[];
  conteneurs?: ConteneurData[];
}

interface TrajetEditDialogTriggerProps {
  trajetId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TrajetEditDialogTrigger({
  trajetId,
  open,
  onOpenChange,
  onSuccess,
}: TrajetEditDialogTriggerProps) {
  const router = useRouter();
  const [trajet, setTrajet] = useState<TrajetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch trajet data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrajetByIdClient(trajetId);
      if (data) {
        // Transform the data to match the expected format
        const transformedData: TrajetData = {
          ...data,
          chauffeur_id: data.chauffeur?.id || "",
          vehicule_id: data.vehicule?.id || "",
          localite_depart_id: data.localite_depart?.id || "",
          localite_arrivee_id: data.localite_arrivee?.id || "",
          // Map conteneurs to conteneur_trajet format
          conteneur_trajet: data.conteneurs?.map((c: {
            id?: string;
            type_conteneur?: { id: string } | null;
            numero_conteneur?: string | null;
            statut_livraison?: string | null;
          }) => ({
            id: c.id,
            type_conteneur_id: c.type_conteneur?.id || "",
            numero_conteneur: c.numero_conteneur,
            statut_livraison: c.statut_livraison,
          })),
        };
        setTrajet(transformedData);
      } else {
        setError("Trajet non trouvé");
      }
    } catch (err) {
      console.error("Erreur chargement trajet:", err);
      setError("Erreur lors du chargement du trajet");
    } finally {
      setLoading(false);
    }
  }, [trajetId]);

  // Handle dialog open change
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen && !trajet && !loading) {
        // Fetch data when opening
        fetchData();
      } else if (!newOpen) {
        // Reset state when closing
        setTrajet(null);
        setError(null);
      }
      onOpenChange(newOpen);
    },
    [trajet, loading, fetchData, onOpenChange]
  );

  // Trigger initial fetch when opened from parent
  if (open && !trajet && !loading && !error) {
    fetchData();
  }

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
    router.refresh();
  };

  // Show loading state
  if (open && loading) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chargement...</DialogTitle>
            <DialogDescription>
              Récupération des données du trajet
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error state
  if (open && error) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Erreur</DialogTitle>
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // Show edit dialog when data is loaded
  if (open && trajet) {
    return (
      <TrajetEditDialog
        open={open}
        onOpenChange={handleOpenChange}
        trajet={trajet}
        onSuccess={handleSuccess}
      />
    );
  }

  return null;
}
