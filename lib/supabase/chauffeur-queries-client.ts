/**
 * Queries Supabase client-side pour les chauffeurs
 *
 * Queries à utiliser dans les Client Components pour:
 * - Récupérer la liste des chauffeurs avec filtres
 * - Récupérer les détails d'un chauffeur
 * - Récupérer les statistiques d'un chauffeur
 */

import { createClient } from "@/lib/supabase/client";
import type { ChauffeurFilters } from "@/lib/validations/chauffeur";

/**
 * Récupère la liste des chauffeurs avec filtres et pagination
 */
export async function fetchChauffeursClient(options?: {
  filters?: ChauffeurFilters;
  page?: number;
  pageSize?: number;
}) {
  const supabase = createClient();
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("chauffeur")
    .select(
      `
      *
    `,
      { count: "exact" }
    );

  // Appliquer les filtres
  if (options?.filters) {
    const { statut, search } = options.filters;

    if (statut) {
      query = query.eq("statut", statut);
    }
    if (search) {
      query = query.or(
        `nom.ilike.%${search}%,prenom.ilike.%${search}%,telephone.ilike.%${search}%`
      );
    }
  }

  const { data, error, count } = await query
    .order("nom")
    .range(from, to);

  if (error) {
    console.error("Erreur récupération chauffeurs:", error);
    throw error;
  }

  return {
    chauffeurs: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  };
}

/**
 * Récupère les détails complets d'un chauffeur
 */
export async function fetchChauffeurByIdClient(chauffeurId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chauffeur")
    .select(
      `
      *
    `
    )
    .eq("id", chauffeurId)
    .single();

  if (error) {
    console.error("Erreur récupération chauffeur:", error);
    throw error;
  }

  return data;
}

/**
 * Récupère l'historique des trajets d'un chauffeur avec pagination
 */
export async function fetchChauffeurTrajetsClient(
  chauffeurId: string,
  options?: {
    page?: number;
    pageSize?: number;
  }
) {
  const supabase = createClient();
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("trajet")
    .select(
      `
      id,
      date_trajet,
      parcours_total,
      consommation_au_100,
      litrage_station,
      prix_litre,
      statut,
      localite_depart:localite_depart_id(nom, region),
      localite_arrivee:localite_arrivee_id(nom, region),
      vehicule:vehicule(immatriculation, marque, modele)
    `,
      { count: "exact" }
    )
    .eq("chauffeur_id", chauffeurId)
    .order("date_trajet", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Erreur récupération trajets chauffeur:", error);
    throw error;
  }

  return {
    trajets: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  };
}

/**
 * Récupère tous les chauffeurs actifs (pour sélecteurs de formulaire)
 */
export async function fetchChauffeursActifsClient() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chauffeur")
    .select("id, nom, prenom, statut")
    .eq("statut", "actif")
    .order("nom");

  if (error) {
    console.error("Erreur récupération chauffeurs actifs:", error);
    throw error;
  }

  return data || [];
}
