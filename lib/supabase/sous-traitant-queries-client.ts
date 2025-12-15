import { createClient } from '@/lib/supabase/client'
import type { SousTraitantFilters } from '@/lib/validations/sous-traitant'

/**
 * Récupère la liste des sous-traitants avec filtres (client-side)
 */
export async function fetchSousTraitantsClient(filters?: SousTraitantFilters) {
  const supabase = createClient()

  let query = supabase
    .from('sous_traitant')
    .select('*')
    .order('nom_entreprise', { ascending: true })

  // Filtrage par statut
  if (filters?.statut && filters.statut !== 'tous') {
    query = query.eq('statut', filters.statut)
  }

  // Recherche par nom d'entreprise, contact ou téléphone
  if (filters?.search) {
    query = query.or(
      `nom_entreprise.ilike.%${filters.search}%,contact_principal.ilike.%${filters.search}%,telephone.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching sous-traitants:', error)
    throw error
  }

  return data ?? []
}

/**
 * Récupère un sous-traitant par ID avec ses missions (client-side)
 */
export async function fetchSousTraitantByIdClient(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sous_traitant')
    .select(
      `
      *,
      missions:mission_sous_traitance(
        id,
        date_mission,
        montant_total,
        montant_90_pourcent,
        reste_10_pourcent,
        avance_payee,
        solde_paye,
        statut,
        localite_depart:localite_depart_id(id, nom),
        localite_arrivee:localite_arrivee_id(id, nom),
        type_conteneur:type_conteneur(id, nom, taille_pieds)
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching sous-traitant:', error)
    throw error
  }

  return data
}

/**
 * Récupère les statistiques d'un sous-traitant (client-side)
 */
export async function fetchSousTraitantStatsClient(id: string) {
  const supabase = createClient()

  // Récupérer toutes les missions du sous-traitant
  const { data: missions, error } = await supabase
    .from('mission_sous_traitance')
    .select('montant_total, montant_90_pourcent, reste_10_pourcent, avance_payee, solde_paye, statut')
    .eq('sous_traitant_id', id)

  if (error) {
    console.error('Error fetching sous-traitant stats:', error)
    throw error
  }

  if (!missions || missions.length === 0) {
    return {
      total_missions: 0,
      missions_en_cours: 0,
      missions_terminees: 0,
      montant_total_missions: 0,
      montant_paye: 0,
      montant_restant: 0,
    }
  }

  const stats = {
    total_missions: missions.length,
    missions_en_cours: missions.filter((m) => m.statut === 'en_cours').length,
    missions_terminees: missions.filter((m) => m.statut === 'terminee').length,
    montant_total_missions: missions.reduce((sum, m) => sum + (Number(m.montant_total) || 0), 0),
    montant_paye: missions.reduce((sum, m) => {
      let paid = 0
      if (m.avance_payee) paid += Number(m.montant_90_pourcent) || 0
      if (m.solde_paye) paid += Number(m.reste_10_pourcent) || 0
      return sum + paid
    }, 0),
    montant_restant: 0,
  }

  stats.montant_restant = stats.montant_total_missions - stats.montant_paye

  return stats
}

// ===================================
// MISSION_SOUS_TRAITANCE - Queries
// ===================================

/**
 * Récupère la liste des missions de sous-traitance avec filtres (client-side)
 */
export async function fetchMissionsSousTraitanceClient(options?: {
  filters?: import('@/lib/validations/sous-traitant').MissionSousTraitanceFilters;
  page?: number;
  pageSize?: number;
}) {
  const supabase = createClient();
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("mission_sous_traitance")
    .select(
      `
      *,
      sous_traitant:sous_traitant!inner(id, nom_entreprise, contact_principal, telephone),
      localite_depart:localite_depart_id(id, nom, region),
      localite_arrivee:localite_arrivee_id(id, nom, region),
      type_conteneur:type_conteneur_id(id, nom, taille_pieds)
    `,
      { count: "exact" }
    );

  // Appliquer les filtres
  if (options?.filters) {
    const {
      sous_traitant_id,
      date_debut,
      date_fin,
      localite_depart_id,
      localite_arrivee_id,
      statut,
      paiement_statut,
    } = options.filters;

    if (sous_traitant_id) {
      query = query.eq("sous_traitant_id", sous_traitant_id);
    }
    if (date_debut) {
      query = query.gte("date_mission", date_debut);
    }
    if (date_fin) {
      query = query.lte("date_mission", date_fin);
    }
    if (localite_depart_id) {
      query = query.eq("localite_depart_id", localite_depart_id);
    }
    if (localite_arrivee_id) {
      query = query.eq("localite_arrivee_id", localite_arrivee_id);
    }
    if (statut) {
      query = query.eq("statut", statut);
    }
    if (paiement_statut) {
      if (paiement_statut === "non_paye") {
        query = query.eq("avance_payee", false).eq("solde_paye", false);
      } else if (paiement_statut === "avance_payee") {
        query = query.eq("avance_payee", true).eq("solde_paye", false);
      } else if (paiement_statut === "complet") {
        query = query.eq("avance_payee", true).eq("solde_paye", true);
      }
    }
  }

  const { data, error, count } = await query
    .order("date_mission", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Erreur récupération missions sous-traitance:", error.message, error.code, error.details, error.hint);
    throw new Error(error.message || "Erreur lors de la récupération des missions de sous-traitance");
  }

  return {
    missions: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  };
}

/**
 * Récupère les détails d'une mission de sous-traitance (client-side)
 */
export async function fetchMissionSousTraitanceByIdClient(missionId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("mission_sous_traitance")
    .select(
      `
      *,
      sous_traitant:sous_traitant(id, nom_entreprise, contact_principal, telephone, email, adresse),
      localite_depart:localite_depart_id(id, nom, region),
      localite_arrivee:localite_arrivee_id(id, nom, region),
      type_conteneur:type_conteneur_id(id, nom, taille_pieds)
    `
    )
    .eq("id", missionId)
    .single();

  if (error) {
    console.error("Erreur récupération mission sous-traitance:", error.message, error.code, error.details, error.hint);
    throw new Error(error.message || "Erreur lors de la récupération de la mission de sous-traitance");
  }

  return data;
}
