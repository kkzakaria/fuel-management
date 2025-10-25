/**
 * Server Actions pour la gestion des missions de sous-traitance
 *
 * Actions serveur sécurisées avec next-safe-action pour:
 * - Création de missions
 * - Modification de missions
 * - Gestion des paiements (avance et solde)
 * - Suppression de missions
 */

'use server'

import { revalidatePath } from 'next/cache'
import { action } from '@/lib/safe-action'
import { createClient } from '@/lib/supabase/server'
import {
  createMissionSchema,
  updateMissionSchema,
  paymentMissionSchema,
} from '@/lib/validations/mission'
import { z } from 'zod'

/**
 * Action: Créer une nouvelle mission
 */
export const createMissionAction = action
  .schema(createMissionSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()

    // Créer la mission
    const { data: mission, error } = await supabase
      .from('mission_sous_traitance')
      .insert(parsedInput)
      .select()
      .single()

    if (error) {
      console.error('Erreur création mission:', error)
      throw new Error('Erreur lors de la création de la mission')
    }

    revalidatePath('/sous-traitance/missions')
    revalidatePath(`/sous-traitance/${parsedInput.sous_traitant_id}`)
    return { success: true, data: mission }
  })

/**
 * Action: Mettre à jour une mission
 */
export const updateMissionAction = action
  .schema(
    z.object({
      id: z.string().uuid(),
      data: updateMissionSchema,
    })
  )
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()
    const { id, data: updateData } = parsedInput

    // Mettre à jour la mission
    const { data: mission, error } = await supabase
      .from('mission_sous_traitance')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour mission:', error)
      throw new Error('Erreur lors de la mise à jour de la mission')
    }

    // Récupérer le sous_traitant_id pour revalider sa page
    const { data: missionData } = await supabase
      .from('mission_sous_traitance')
      .select('sous_traitant_id')
      .eq('id', id)
      .single()

    revalidatePath('/sous-traitance/missions')
    revalidatePath(`/sous-traitance/missions/${id}`)
    if (missionData?.sous_traitant_id) {
      revalidatePath(`/sous-traitance/${missionData.sous_traitant_id}`)
    }

    return { success: true, data: mission }
  })

/**
 * Action: Marquer l'avance comme payée
 */
export const payAvanceAction = action
  .schema(
    z.object({
      id: z.string().uuid(),
      date_paiement: z.date(),
    })
  )
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()
    const { id, date_paiement } = parsedInput

    const { data: mission, error } = await supabase
      .from('mission_sous_traitance')
      .update({
        avance_payee: true,
        date_paiement_avance: date_paiement.toISOString().split('T')[0],
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur paiement avance:', error)
      throw new Error("Erreur lors de l'enregistrement du paiement de l'avance")
    }

    revalidatePath('/sous-traitance/missions')
    revalidatePath(`/sous-traitance/missions/${id}`)
    return { success: true, data: mission }
  })

/**
 * Action: Marquer le solde comme payé
 */
export const paySoldeAction = action
  .schema(
    z.object({
      id: z.string().uuid(),
      date_paiement: z.date(),
    })
  )
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()
    const { id, date_paiement } = parsedInput

    // Vérifier que l'avance a été payée
    const { data: currentMission } = await supabase
      .from('mission_sous_traitance')
      .select('avance_payee')
      .eq('id', id)
      .single()

    if (!currentMission?.avance_payee) {
      throw new Error("L'avance doit être payée avant de payer le solde")
    }

    const { data: mission, error } = await supabase
      .from('mission_sous_traitance')
      .update({
        solde_paye: true,
        date_paiement_solde: date_paiement.toISOString().split('T')[0],
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur paiement solde:', error)
      throw new Error("Erreur lors de l'enregistrement du paiement du solde")
    }

    revalidatePath('/sous-traitance/missions')
    revalidatePath(`/sous-traitance/missions/${id}`)
    return { success: true, data: mission }
  })

/**
 * Action: Mettre à jour les informations de paiement d'une mission
 */
export const updateMissionPaymentAction = action
  .schema(
    z.object({
      id: z.string().uuid(),
      data: paymentMissionSchema,
    })
  )
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()
    const { id, data: paymentData } = parsedInput

    // Validation: le solde ne peut être payé que si l'avance est payée
    if (paymentData.solde_paye && !paymentData.avance_payee) {
      const { data: currentMission } = await supabase
        .from('mission_sous_traitance')
        .select('avance_payee')
        .eq('id', id)
        .single()

      if (!currentMission?.avance_payee && !paymentData.avance_payee) {
        throw new Error("L'avance doit être payée avant de payer le solde")
      }
    }

    // Formater les dates pour PostgreSQL
    const updateData: Record<string, unknown> = {}

    if (paymentData['avance_payee'] !== undefined) {
      updateData['avance_payee'] = paymentData['avance_payee']
    }
    if (paymentData['solde_paye'] !== undefined) {
      updateData['solde_paye'] = paymentData['solde_paye']
    }
    if (paymentData['date_paiement_avance'] !== undefined) {
      updateData['date_paiement_avance'] = paymentData['date_paiement_avance']
        ? paymentData['date_paiement_avance'].toISOString().split('T')[0]
        : null
    }
    if (paymentData['date_paiement_solde'] !== undefined) {
      updateData['date_paiement_solde'] = paymentData['date_paiement_solde']
        ? paymentData['date_paiement_solde'].toISOString().split('T')[0]
        : null
    }

    const { data: mission, error } = await supabase
      .from('mission_sous_traitance')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour paiement:', error)
      throw new Error('Erreur lors de la mise à jour du paiement')
    }

    revalidatePath('/sous-traitance/missions')
    revalidatePath(`/sous-traitance/missions/${id}`)
    return { success: true, data: mission }
  })

/**
 * Action: Supprimer une mission
 */
export const deleteMissionAction = action
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()
    const { id } = parsedInput

    // Récupérer le sous_traitant_id avant suppression
    const { data: missionData } = await supabase
      .from('mission_sous_traitance')
      .select('sous_traitant_id')
      .eq('id', id)
      .single()

    // Supprimer la mission
    const { error } = await supabase
      .from('mission_sous_traitance')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur suppression mission:', error)
      throw new Error('Erreur lors de la suppression de la mission')
    }

    revalidatePath('/sous-traitance/missions')
    if (missionData?.sous_traitant_id) {
      revalidatePath(`/sous-traitance/${missionData.sous_traitant_id}`)
    }

    return { success: true }
  })
