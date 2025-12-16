/**
 * Page de confirmation de suppression d'un trajet
 */

import { notFound } from "next/navigation";
import { getTrajetById } from "@/lib/supabase/queries";
import { TrajetDeleteConfirm } from "@/components/trajets/trajet-delete-confirm";

interface SupprimerTrajetPageProps {
  params: Promise<{ id: string }>;
}

export default async function SupprimerTrajetPage({ params }: SupprimerTrajetPageProps) {
  const { id } = await params;

  let trajet;
  try {
    trajet = await getTrajetById(id);
  } catch (error) {
    console.error("Erreur chargement trajet:", error);
    notFound();
  }

  if (!trajet) {
    notFound();
  }

  return (
    <div className="container py-6">
      <TrajetDeleteConfirm
        trajetId={id}
        numeroTrajet={trajet.numero_trajet}
        localiteDepart={trajet.localite_depart?.nom || ""}
        localiteArrivee={trajet.localite_arrivee?.nom || ""}
        dateTrajet={trajet.date_trajet}
      />
    </div>
  );
}
