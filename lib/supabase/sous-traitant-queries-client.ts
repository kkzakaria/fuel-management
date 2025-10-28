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
