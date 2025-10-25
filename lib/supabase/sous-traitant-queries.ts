import { createClient } from '@/lib/supabase/server'

/**
 * Récupère les statistiques d'un sous-traitant (server-side)
 */
export async function fetchSousTraitantStats(id: string) {
  const supabase = await createClient()

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
