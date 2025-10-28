import { createClient } from '@/lib/supabase/client'
import type { MissionFilters } from '@/lib/validations/mission'
import { calculatePaymentStatus } from '@/lib/validations/mission'

/**
 * Récupère la liste des missions avec filtres et pagination (client-side)
 */
export async function fetchMissionsClient(
  filters?: MissionFilters,
  page = 1,
  pageSize = 20
) {
  const supabase = createClient()

  let query = supabase
    .from('mission_sous_traitance')
    .select(
      `
      *,
      sous_traitant:sous_traitant(id, nom_entreprise, contact_principal, telephone),
      localite_depart:localite_depart_id(id, nom),
      localite_arrivee:localite_arrivee_id(id, nom),
      type_conteneur:type_conteneur(id, nom, taille_pieds)
    `,
      { count: 'exact' }
    )
    .order('date_mission', { ascending: false })

  // Filtrage par sous-traitant
  if (filters?.sous_traitant_id) {
    query = query.eq('sous_traitant_id', filters.sous_traitant_id)
  }

  // Filtrage par statut
  if (filters?.statut && filters.statut !== 'tous') {
    query = query.eq('statut', filters.statut)
  }

  // Filtrage par date
  if (filters?.date_debut) {
    query = query.gte('date_mission', filters.date_debut.toISOString().split('T')[0])
  }
  if (filters?.date_fin) {
    query = query.lte('date_mission', filters.date_fin.toISOString().split('T')[0])
  }

  // Recherche par numéro de conteneur
  if (filters?.search) {
    query = query.ilike('numero_conteneur', `%${filters.search}%`)
  }

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching missions:', error)
    throw error
  }

  // Calculer le statut de paiement pour chaque mission
  const missionsWithPaymentStatus = (data ?? []).map((mission) => ({
    ...mission,
    statut_paiement: calculatePaymentStatus(
      mission.avance_payee ?? false,
      mission.solde_paye ?? false
    ),
  }))

  // Filtrage par statut de paiement (côté client car c'est calculé)
  let filteredMissions = missionsWithPaymentStatus
  if (filters?.statut_paiement && filters.statut_paiement !== 'tous') {
    filteredMissions = missionsWithPaymentStatus.filter(
      (m) => m.statut_paiement === filters.statut_paiement
    )
  }

  return {
    missions: filteredMissions,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  }
}

/**
 * Récupère une mission par ID avec détails (client-side)
 */
export async function fetchMissionByIdClient(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('mission_sous_traitance')
    .select(
      `
      *,
      sous_traitant:sous_traitant(id, nom_entreprise, contact_principal, telephone, email, adresse),
      localite_depart:localite_depart_id(id, nom, region),
      localite_arrivee:localite_arrivee_id(id, nom, region),
      type_conteneur:type_conteneur(id, nom, taille_pieds, description)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching mission:', error)
    throw error
  }

  // Ajouter le statut de paiement calculé
  return {
    ...data,
    statut_paiement: calculatePaymentStatus(
      data.avance_payee ?? false,
      data.solde_paye ?? false
    ),
  }
}

/**
 * Récupère les missions en attente de paiement (client-side)
 */
export async function fetchMissionsEnAttentePaiementClient() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('mission_sous_traitance')
    .select(
      `
      *,
      sous_traitant:sous_traitant(id, nom_entreprise, contact_principal)
    `
    )
    .eq('statut', 'terminee')
    .or('avance_payee.is.false,solde_paye.is.false')
    .order('date_mission', { ascending: true })

  if (error) {
    console.error('Error fetching missions en attente:', error)
    throw error
  }

  return (data ?? []).map((mission) => ({
    ...mission,
    statut_paiement: calculatePaymentStatus(
      mission.avance_payee ?? false,
      mission.solde_paye ?? false
    ),
  }))
}

/**
 * Calcule les statistiques financières globales des missions (client-side)
 */
export async function fetchMissionsFinancialStatsClient() {
  const supabase = createClient()

  const { data: missions, error } = await supabase
    .from('mission_sous_traitance')
    .select('montant_total, montant_90_pourcent, reste_10_pourcent, avance_payee, solde_paye, statut')

  if (error) {
    console.error('Error fetching financial stats:', error)
    throw error
  }

  if (!missions || missions.length === 0) {
    return {
      montant_total: 0,
      montant_paye: 0,
      montant_restant: 0,
      nombre_missions_en_attente: 0,
    }
  }

  const stats = {
    montant_total: missions.reduce((sum, m) => sum + (Number(m.montant_total) || 0), 0),
    montant_paye: missions.reduce((sum, m) => {
      let paid = 0
      if (m.avance_payee) paid += Number(m.montant_90_pourcent) || 0
      if (m.solde_paye) paid += Number(m.reste_10_pourcent) || 0
      return sum + paid
    }, 0),
    montant_restant: 0,
    nombre_missions_en_attente: missions.filter(
      (m) => m.statut === 'terminee' && (!m.avance_payee || !m.solde_paye)
    ).length,
  }

  stats.montant_restant = stats.montant_total - stats.montant_paye

  return stats
}
