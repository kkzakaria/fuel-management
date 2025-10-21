/**
 * Queries Supabase client-side pour les véhicules
 *
 * Queries à utiliser dans les Client Components pour:
 * - Récupérer la liste des véhicules avec filtres
 * - Récupérer les détails d'un véhicule
 * - Récupérer les statistiques d'un véhicule
 */

import { createClient } from "@/lib/supabase/client";
import type { VehiculeFilters } from "@/lib/validations/vehicule";

/**
 * Récupère la liste des véhicules avec filtres et pagination
 */
export async function fetchVehiculesClient(options?: {
  filters?: VehiculeFilters;
  page?: number;
  pageSize?: number;
}) {
  const supabase = createClient();
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("vehicule")
    .select(
      `
      *
    `,
      { count: "exact" }
    );

  // Appliquer les filtres
  if (options?.filters) {
    const { statut, type_carburant, search } = options.filters;

    if (statut) {
      query = query.eq("statut", statut);
    }
    if (type_carburant) {
      query = query.eq("type_carburant", type_carburant);
    }
    if (search) {
      query = query.or(
        `immatriculation.ilike.%${search}%,marque.ilike.%${search}%,modele.ilike.%${search}%`
      );
    }
  }

  const { data, error, count } = await query
    .order("immatriculation")
    .range(from, to);

  if (error) {
    console.error("Erreur récupération véhicules:", error);
    throw error;
  }

  return {
    vehicules: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  };
}

/**
 * Récupère les détails complets d'un véhicule
 */
export async function fetchVehiculeByIdClient(vehiculeId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("vehicule")
    .select(
      `
      *
    `
    )
    .eq("id", vehiculeId)
    .single();

  if (error) {
    console.error("Erreur récupération véhicule:", error);
    throw error;
  }

  return data;
}

/**
 * Récupère l'historique des trajets d'un véhicule avec pagination
 */
export async function fetchVehiculeTrajetsClient(
  vehiculeId: string,
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
      ecart_litrage,
      localite_depart:localite!trajet_localite_depart_id_fkey(nom, region),
      localite_arrivee:localite!trajet_localite_arrivee_id_fkey(nom, region),
      chauffeur:chauffeur(nom, prenom)
    `,
      { count: "exact" }
    )
    .eq("vehicule_id", vehiculeId)
    .order("date_trajet", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Erreur récupération trajets véhicule:", error);
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
 * Récupère tous les véhicules actifs (pour sélecteurs de formulaire)
 */
export async function fetchVehiculesActifsClient() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("vehicule")
    .select("id, immatriculation, marque, modele, type_carburant, statut")
    .eq("statut", "actif")
    .order("immatriculation");

  if (error) {
    console.error("Erreur récupération véhicules actifs:", error);
    throw error;
  }

  return data || [];
}
