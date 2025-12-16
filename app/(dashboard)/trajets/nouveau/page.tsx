/**
 * Page de création d'un nouveau trajet
 * Supporte la pré-sélection du chauffeur via ?chauffeurId=xxx
 */

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrajetForm } from "@/components/trajets/trajet-form";

export default function NouveauTrajetPage() {
  const searchParams = useSearchParams();
  const chauffeurId = searchParams.get("chauffeurId");

  return (
    <div className="container py-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/trajets">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nouveau trajet</h1>
          <p className="text-muted-foreground">
            Créer un nouveau trajet de livraison
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <TrajetForm defaultChauffeurId={chauffeurId || undefined} />
    </div>
  );
}
