/**
 * Page de détails d'un trajet
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrajetDetails } from "@/components/trajets/trajet-details";
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

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/trajets/${id}/modifier`}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <Button variant="destructive" asChild>
            <Link href={`/trajets/${id}/supprimer`}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Link>
          </Button>
        </div>
      </div>

      {/* Détails */}
      <TrajetDetails trajet={trajet} />
    </div>
  );
}
