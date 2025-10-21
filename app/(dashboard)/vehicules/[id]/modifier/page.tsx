/**
 * Page de modification d'un véhicule
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehiculeForm } from "@/components/vehicules/vehicule-form";
import { createClient } from "@/lib/supabase/server";

interface ModifierVehiculePageProps {
  params: Promise<{ id: string }>;
}

export default async function ModifierVehiculePage({ params }: ModifierVehiculePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Récupérer le véhicule
  const { data: vehicule, error } = await supabase
    .from("vehicule")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !vehicule) {
    console.error("Erreur chargement véhicule:", error);
    notFound();
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/vehicules/${id}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Modifier le véhicule</h1>
          <p className="text-muted-foreground">{vehicule.immatriculation}</p>
        </div>
      </div>

      {/* Formulaire */}
      <VehiculeForm vehicule={vehicule} />
    </div>
  );
}
