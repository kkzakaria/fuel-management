/**
 * API Route: /api/trajets/[numero]
 *
 * Fetch a trajet by its numero_trajet
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteParams {
  params: Promise<{
    numero: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { numero } = await params;

    if (!numero) {
      return NextResponse.json(
        { error: "Numéro de trajet requis" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: trajet, error } = await supabase
      .from("trajet")
      .select(
        `
        *,
        chauffeur:chauffeur(id, nom, prenom, telephone, statut),
        vehicule:vehicule(id, immatriculation, marque, modele, type_carburant, statut),
        localite_depart:localite_depart_id(id, nom, region),
        localite_arrivee:localite_arrivee_id(id, nom, region),
        conteneurs:conteneur_trajet(
          *,
          type_conteneur:type_conteneur(id, nom, taille_pieds, description)
        )
      `,
      )
      .eq("numero_trajet", numero)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Trajet non trouvé" },
          { status: 404 },
        );
      }
      throw error;
    }

    return NextResponse.json(trajet);
  } catch (error) {
    console.error("Erreur récupération trajet:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}
