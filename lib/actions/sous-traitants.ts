/**
 * Server Actions pour la gestion des sous-traitants
 *
 * Actions serveur sécurisées avec next-safe-action pour:
 * - Création de sous-traitants
 * - Modification de sous-traitants
 * - Suppression de sous-traitants
 */

'use server'

import { revalidatePath } from 'next/cache'
import { action } from '@/lib/safe-action'
import { createClient } from '@/lib/supabase/server'
import {
  createSousTraitantSchema,
  updateSousTraitantSchema,
} from '@/lib/validations/sous-traitant'
import { z } from 'zod'

/**
 * Action: Créer un nouveau sous-traitant
 */
export const createSousTraitantAction = action
  .schema(createSousTraitantSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()

    // Vérifier si le nom d'entreprise existe déjà
    const { data: existing } = await supabase
      .from('sous_traitant')
      .select('id')
      .eq('nom_entreprise', parsedInput.nom_entreprise)
      .single()

    if (existing) {
      throw new Error('Une entreprise avec ce nom existe déjà')
    }

    // Créer le sous-traitant
    const { data: sousTraitant, error } = await supabase
      .from('sous_traitant')
      .insert(parsedInput)
      .select()
      .single()

    if (error) {
      console.error('Erreur création sous-traitant:', error)
      throw new Error('Erreur lors de la création du sous-traitant')
    }

    revalidatePath('/sous-traitance')
    return { success: true, data: sousTraitant }
  })

/**
 * Action: Mettre à jour un sous-traitant
 */
export const updateSousTraitantAction = action
  .schema(
    z.object({
      id: z.string().uuid(),
      data: updateSousTraitantSchema,
    })
  )
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()
    const { id, data: updateData } = parsedInput

    // Vérifier si le nouveau nom d'entreprise est déjà pris (si changé)
    if (updateData.nom_entreprise) {
      const { data: existing } = await supabase
        .from('sous_traitant')
        .select('id')
        .eq('nom_entreprise', updateData.nom_entreprise)
        .neq('id', id)
        .single()

      if (existing) {
        throw new Error('Une entreprise avec ce nom existe déjà')
      }
    }

    // Mettre à jour le sous-traitant
    const { data: sousTraitant, error } = await supabase
      .from('sous_traitant')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour sous-traitant:', error)
      throw new Error('Erreur lors de la mise à jour du sous-traitant')
    }

    revalidatePath('/sous-traitance')
    revalidatePath(`/sous-traitance/${id}`)
    return { success: true, data: sousTraitant }
  })

/**
 * Action: Supprimer un sous-traitant
 */
export const deleteSousTraitantAction = action
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()
    const { id } = parsedInput

    // Vérifier s'il y a des missions associées
    const { data: missions } = await supabase
      .from('mission_sous_traitance')
      .select('id')
      .eq('sous_traitant_id', id)
      .limit(1)

    if (missions && missions.length > 0) {
      throw new Error(
        'Impossible de supprimer ce sous-traitant car il a des missions associées'
      )
    }

    // Supprimer le sous-traitant
    const { error } = await supabase
      .from('sous_traitant')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur suppression sous-traitant:', error)
      throw new Error('Erreur lors de la suppression du sous-traitant')
    }

    revalidatePath('/sous-traitance')
    return { success: true }
  })

// ===================================
// MISSION_SOUS_TRAITANCE - Actions
// ===================================

import {
  createMissionSousTraitanceSchema,
  updateMissionSousTraitanceSchema,
} from '@/lib/validations/sous-traitant'

/**
 * Action: Créer une nouvelle mission de sous-traitance
 */
export const createMissionSousTraitanceAction = action
  .schema(createMissionSousTraitanceSchema)
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

    revalidatePath('/sous-traitance')
    revalidatePath(`/sous-traitance/${parsedInput.sous_traitant_id}`)
    return { success: true, data: mission }
  })

/**
 * Action: Mettre à jour une mission de sous-traitance
 */
export const updateMissionSousTraitanceAction = action
  .schema(
    z.object({
      id: z.string().uuid(),
      data: updateMissionSousTraitanceSchema,
    })
  )
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()
    const { id, data: updateData } = parsedInput

    // Récupérer la mission pour obtenir le sous_traitant_id
    const { data: existingMission } = await supabase
      .from('mission_sous_traitance')
      .select('sous_traitant_id')
      .eq('id', id)
      .single()

    if (!existingMission) {
      throw new Error('Mission introuvable')
    }

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

    revalidatePath('/sous-traitance')
    revalidatePath(`/sous-traitance/${existingMission.sous_traitant_id}`)
    revalidatePath(`/sous-traitance/missions/${id}`)
    return { success: true, data: mission }
  })

/**
 * Action: Supprimer une mission de sous-traitance
 */
export const deleteMissionSousTraitanceAction = action
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()
    const { id } = parsedInput

    // Récupérer la mission pour obtenir le sous_traitant_id
    const { data: existingMission } = await supabase
      .from('mission_sous_traitance')
      .select('sous_traitant_id')
      .eq('id', id)
      .single()

    if (!existingMission) {
      throw new Error('Mission introuvable')
    }

    // Supprimer la mission
    const { error } = await supabase
      .from('mission_sous_traitance')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur suppression mission:', error)
      throw new Error('Erreur lors de la suppression de la mission')
    }

    revalidatePath('/sous-traitance')
    revalidatePath(`/sous-traitance/${existingMission.sous_traitant_id}`)
    return { success: true }
  })

/**
 * Action: Marquer une avance comme payée
 */
export const markAvancePayeeAction = action
  .schema(
    z.object({
      id: z.string().uuid(),
      date_paiement: z.string().or(z.date()),
    })
  )
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()
    const { id, date_paiement } = parsedInput

    const { data: mission, error } = await supabase
      .from('mission_sous_traitance')
      .update({
        avance_payee: true,
        date_paiement_avance: date_paiement,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur marquage avance payée:', error)
      throw new Error('Erreur lors du marquage de l\'avance comme payée')
    }

    revalidatePath('/sous-traitance')
    revalidatePath(`/sous-traitance/${mission.sous_traitant_id}`)
    revalidatePath(`/sous-traitance/missions/${id}`)
    return { success: true, data: mission }
  })

/**
 * Action: Marquer un solde comme payé
 */
export const markSoldePayeAction = action
  .schema(
    z.object({
      id: z.string().uuid(),
      date_paiement: z.string().or(z.date()),
    })
  )
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()
    const { id, date_paiement } = parsedInput

    // Vérifier que l'avance est déjà payée
    const { data: existingMission } = await supabase
      .from('mission_sous_traitance')
      .select('avance_payee, sous_traitant_id')
      .eq('id', id)
      .single()

    if (!existingMission) {
      throw new Error('Mission introuvable')
    }

    if (!existingMission.avance_payee) {
      throw new Error('L\'avance doit être payée avant le solde')
    }

    const { data: mission, error } = await supabase
      .from('mission_sous_traitance')
      .update({
        solde_paye: true,
        date_paiement_solde: date_paiement,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur marquage solde payé:', error)
      throw new Error('Erreur lors du marquage du solde comme payé')
    }

    revalidatePath('/sous-traitance')
    revalidatePath(`/sous-traitance/${existingMission.sous_traitant_id}`)
    revalidatePath(`/sous-traitance/missions/${id}`)
    return { success: true, data: mission }
  })
