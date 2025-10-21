/**
 * Page de modification d'un chauffeur
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChauffeurForm } from "@/components/chauffeurs/chauffeur-form";
import { createClient } from "@/lib/supabase/server";

interface ModifierChauffeurPageProps {
  params: Promise<{ id: string }>;
}

export default async function ModifierChauffeurPage({ params }: ModifierChauffeurPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Récupérer le chauffeur
  const { data: chauffeur, error } = await supabase
    .from("chauffeur")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !chauffeur) {
    console.error("Erreur chargement chauffeur:", error);
    notFound();
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/chauffeurs/${id}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Modifier le chauffeur</h1>
          <p className="text-muted-foreground">
            {chauffeur.prenom} {chauffeur.nom}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <ChauffeurForm chauffeur={chauffeur} />
    </div>
  );
}
