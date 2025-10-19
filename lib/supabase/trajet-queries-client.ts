/**
 * Queries Supabase client-side pour les trajets
 *
 * Queries à utiliser dans les Client Components pour:
 * - Récupérer la liste des trajets avec filtres
 * - Récupérer les détails d'un trajet
 * - Récupérer les données de référence (chauffeurs, véhicules, localités)
 */

import { createClient } from "@/lib/supabase/client";
import type { TrajetFilters } from "@/lib/validations/trajet";

/**
 * Récupère la liste des trajets avec filtres et pagination
 */
export async function fetchTrajetsClient(options?: {
  filters?: TrajetFilters;
  page?: number;
  pageSize?: number;
}) {
  const supabase = createClient();
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("trajet")
    .select(
      `
      *,
      chauffeur:chauffeur(id, nom, prenom),
      vehicule:vehicule(id, immatriculation, marque, modele, type_carburant),
      localite_depart:localite!trajet_localite_depart_id_fkey(id, nom, region),
      localite_arrivee:localite!trajet_localite_arrivee_id_fkey(id, nom, region)
    `,
      { count: "exact" }
    );

  // Appliquer les filtres
  if (options?.filters) {
    const { chauffeur_id, vehicule_id, localite_arrivee_id, date_debut, date_fin, statut } =
      options.filters;

    if (chauffeur_id) {
      query = query.eq("chauffeur_id", chauffeur_id);
    }
    if (vehicule_id) {
      query = query.eq("vehicule_id", vehicule_id);
    }
    if (localite_arrivee_id) {
      query = query.eq("localite_arrivee_id", localite_arrivee_id);
    }
    if (date_debut) {
      query = query.gte("date_trajet", date_debut);
    }
    if (date_fin) {
      query = query.lte("date_trajet", date_fin);
    }
    if (statut) {
      query = query.eq("statut", statut);
    }
  }

  const { data, error, count } = await query
    .order("date_trajet", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Erreur récupération trajets:", error);
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
 * Récupère les détails complets d'un trajet
 */
export async function fetchTrajetByIdClient(trajetId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("trajet")
    .select(
      `
      *,
      chauffeur:chauffeur(id, nom, prenom, telephone, statut),
      vehicule:vehicule(id, immatriculation, marque, modele, type_carburant, statut),
      localite_depart:localite!trajet_localite_depart_id_fkey(id, nom, region),
      localite_arrivee:localite!trajet_localite_arrivee_id_fkey(id, nom, region),
      conteneurs:conteneur_trajet(
        *,
        type_conteneur:type_conteneur(id, nom, taille_pieds, description)
      )
    `
    )
    .eq("id", trajetId)
    .single();

  if (error) {
    console.error("Erreur récupération trajet:", error);
    throw error;
  }

  return data;
}

/**
 * Récupère la liste des chauffeurs actifs
 */
export async function fetchChauffeursActifsClient() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chauffeur")
    .select("id, nom, prenom, telephone, statut")
    .eq("statut", "actif")
    .order("nom");

  if (error) {
    console.error("Erreur récupération chauffeurs:", error);
    throw error;
  }

  return data || [];
}

/**
 * Récupère la liste des véhicules actifs
 */
export async function fetchVehiculesActifsClient() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("vehicule")
    .select("id, immatriculation, marque, modele, type_carburant, statut")
    .in("statut", ["actif", "maintenance"])
    .order("immatriculation");

  if (error) {
    console.error("Erreur récupération véhicules:", error);
    throw error;
  }

  return data || [];
}

/**
 * Récupère la liste des localités
 */
export async function fetchLocalitesClient() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("localite")
    .select("id, nom, region")
    .order("nom");

  if (error) {
    console.error("Erreur récupération localités:", error);
    throw error;
  }

  return data || [];
}

/**
 * Récupère la liste des types de conteneurs
 */
export async function fetchTypeConteneursClient() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("type_conteneur")
    .select("id, nom, taille_pieds, description")
    .order("taille_pieds");

  if (error) {
    console.error("Erreur récupération types conteneurs:", error);
    throw error;
  }

  return data || [];
}

/**
 * Récupère les statistiques des trajets pour une période
 */
export async function fetchTrajetsStatsClient(options?: {
  date_debut?: string;
  date_fin?: string;
  chauffeur_id?: string;
  vehicule_id?: string;
}) {
  const supabase = createClient();

  let query = supabase
    .from("trajet")
    .select("parcours_total, litrage_station, prix_litre, frais_peage, autres_frais");

  if (options?.date_debut) {
    query = query.gte("date_trajet", options.date_debut);
  }
  if (options?.date_fin) {
    query = query.lte("date_trajet", options.date_fin);
  }
  if (options?.chauffeur_id) {
    query = query.eq("chauffeur_id", options.chauffeur_id);
  }
  if (options?.vehicule_id) {
    query = query.eq("vehicule_id", options.vehicule_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erreur récupération statistiques:", error);
    throw error;
  }

  // Calculer les statistiques
  interface StatsAccumulator {
    totalTrajets: number;
    totalKm: number;
    totalLitres: number;
    totalCoutCarburant: number;
    totalPeage: number;
    totalAutresFrais: number;
  }

  interface TrajetStats {
    parcours_total?: number | null;
    litrage_station?: number | null;
    prix_litre?: number | null;
    frais_peage?: number | null;
    autres_frais?: number | null;
  }

  const stats = (data || []).reduce(
    (acc: StatsAccumulator, trajet: TrajetStats) => {
      acc.totalTrajets += 1;
      acc.totalKm += trajet.parcours_total || 0;
      acc.totalLitres += trajet.litrage_station || 0;
      acc.totalCoutCarburant +=
        (trajet.litrage_station || 0) * (trajet.prix_litre || 0);
      acc.totalPeage += trajet.frais_peage || 0;
      acc.totalAutresFrais += trajet.autres_frais || 0;
      return acc;
    },
    {
      totalTrajets: 0,
      totalKm: 0,
      totalLitres: 0,
      totalCoutCarburant: 0,
      totalPeage: 0,
      totalAutresFrais: 0,
    }
  );

  // Calculer la consommation moyenne
  const avgConsommation =
    stats.totalKm > 0 ? (stats.totalLitres / stats.totalKm) * 100 : 0;

  return {
    ...stats,
    avgConsommation,
    coutTotal: stats.totalCoutCarburant + stats.totalPeage + stats.totalAutresFrais,
  };
}
