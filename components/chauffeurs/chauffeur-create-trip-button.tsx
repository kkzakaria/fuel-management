/**
 * Bouton "Créer un trajet" conditionnel
 * Affiché uniquement si le chauffeur est disponible (statut "actif")
 */

"use client";

import Link from "next/link";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChauffeur } from "@/hooks/use-chauffeur";

interface ChauffeurCreateTripButtonProps {
  chauffeurId: string;
}

export function ChauffeurCreateTripButton({ chauffeurId }: ChauffeurCreateTripButtonProps) {
  const { chauffeur, loading } = useChauffeur(chauffeurId);

  // Ne pas afficher pendant le chargement ou si le chauffeur n'est pas disponible
  if (loading || !chauffeur || chauffeur.statut !== "actif") {
    return null;
  }

  return (
    <Button variant="outline" asChild>
      <Link href={`/trajets/nouveau?chauffeurId=${chauffeurId}&returnUrl=/chauffeurs/${chauffeurId}`}>
        <Truck className="mr-2 h-4 w-4" />
        Créer un trajet
      </Link>
    </Button>
  );
}
