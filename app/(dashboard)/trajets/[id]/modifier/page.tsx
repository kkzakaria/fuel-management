/**
 * Page de modification d'un trajet
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrajetForm } from "@/components/trajets/trajet-form";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/date-utils";

interface ModifierTrajetPageProps {
  params: Promise<{ id: string }>;
}

export default async function ModifierTrajetPage({ params }: ModifierTrajetPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Récupérer le trajet avec ses conteneurs
  const { data: trajet, error } = await supabase
    .from("trajet")
    .select(`
      *,
      conteneur_trajet (
        id,
        type_conteneur_id,
        numero_conteneur,
        quantite,
        statut_livraison
      )
    `)
    .eq("id", id)
    .single();

  if (error || !trajet) {
    console.error("Erreur chargement trajet:", error);
    notFound();
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/trajets/${id}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Modifier le trajet</h1>
          <p className="text-muted-foreground">
            Trajet du {formatDate(new Date(trajet.date_trajet))}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <TrajetForm trajet={trajet} />
    </div>
  );
}
