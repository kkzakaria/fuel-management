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
