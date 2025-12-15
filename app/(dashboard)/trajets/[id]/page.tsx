/**
 * Page de détails d'un trajet
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrajetDetails } from "@/components/trajets/trajet-details";
import { TrajetActions } from "@/components/trajets/trajet-actions";
import { getTrajetById } from "@/lib/supabase/queries";

interface TrajetPageProps {
  params: Promise<{ id: string }>;
}

export default async function TrajetPage({ params }: TrajetPageProps) {
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
    <div className="container py-6 space-y-6">
      {/* Navigation et actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/trajets">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Trajet</h1>
            <p className="text-muted-foreground">
              {trajet.localite_depart?.nom} → {trajet.localite_arrivee?.nom}
            </p>
          </div>
        </div>

        <TrajetActions
          trajetId={id}
          statut={trajet.statut}
          kmDebut={trajet.km_debut}
          kmFin={trajet.km_fin}
          litragePrevu={trajet.litrage_prevu}
          fraisPeage={trajet.frais_peage}
          autresFrais={trajet.autres_frais}
        />
      </div>

      {/* Détails */}
      <TrajetDetails trajet={trajet} />
    </div>
  );
}
