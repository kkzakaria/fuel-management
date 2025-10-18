/**
 * Server Actions pour la gestion des trajets
 *
 * Actions serveur sécurisées avec next-safe-action pour:
 * - Création de trajets avec conteneurs
 * - Modification de trajets
 * - Suppression de trajets
 */

"use server";

import { revalidatePath } from "next/cache";
import { action } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";
import {
  createTrajetSchema,
  updateTrajetSchema,
  deleteTrajetSchema,
  updateConteneursSchema,
} from "@/lib/validations/trajet";

/**
 * Action: Créer un nouveau trajet avec ses conteneurs
 */
export const createTrajetAction = action
  .schema(createTrajetSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    // Extraction des conteneurs du input
    const { conteneurs, ...trajetData } = parsedInput;

    // 1. Créer le trajet
    const { data: trajet, error: trajetError } = await supabase
      .from("trajet")
      .insert(trajetData)
      .select()
      .single();

    if (trajetError) {
      console.error("Erreur création trajet:", trajetError);
      throw new Error("Erreur lors de la création du trajet");
    }

    // 2. Créer les conteneurs associés
    const conteneursWithTrajetId = conteneurs.map((c) => ({
      ...c,
      trajet_id: trajet.id,
    }));

    const { error: conteneursError } = await supabase
      .from("conteneur_trajet")
      .insert(conteneursWithTrajetId);

    if (conteneursError) {
      console.error("Erreur création conteneurs:", conteneursError);
      // Rollback: supprimer le trajet si les conteneurs échouent
      await supabase.from("trajet").delete().eq("id", trajet.id);
      throw new Error("Erreur lors de la création des conteneurs");
    }

    // Revalider les caches
    revalidatePath("/trajets");
    revalidatePath("/");

    return {
      success: true,
      trajetId: trajet.id,
      message: "Trajet créé avec succès",
    };
  });

/**
 * Action: Mettre à jour un trajet existant
 * Note: Pour l'instant, cette action nécessite que trajetId soit passé via bindArgsSchemas
 * TODO: Implémenter avec bindArgsSchemas lors de l'utilisation réelle
 */
export const updateTrajetAction = action
  .schema(updateTrajetSchema)
  .action(async ({ parsedInput: _parsedInput }) => {
    // TODO: Récupérer trajetId depuis bindArgs une fois implémenté
    // Pour l'instant, cette action n'est pas utilisée
    throw new Error("updateTrajetAction not yet implemented with proper bindArgs");

    // const { data: trajet, error } = await supabase
    //   .from("trajet")
    //   .update(parsedInput)
    //   .eq("id", trajetId)
    //   .select()
    //   .single();

    // if (error) {
    //   console.error("Erreur mise à jour trajet:", error);
    //   throw new Error("Erreur lors de la mise à jour du trajet");
    // }

    // // Revalider les caches
    // revalidatePath("/trajets");
    // revalidatePath(`/trajets/${trajetId}`);
    // revalidatePath("/");

    // return {
    //   success: true,
    //   trajet,
    //   message: "Trajet mis à jour avec succès",
    // };
  });

/**
 * Action: Supprimer un trajet
 * Note: Les conteneurs seront supprimés automatiquement via CASCADE
 */
export const deleteTrajetAction = action
  .schema(deleteTrajetSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const { trajetId } = parsedInput;

    // Vérifier que le trajet existe
    const { data: trajet, error: fetchError } = await supabase
      .from("trajet")
      .select("id")
      .eq("id", trajetId)
      .single();

    if (fetchError || !trajet) {
      throw new Error("Trajet non trouvé");
    }

    // Supprimer le trajet
    const { error: deleteError } = await supabase
      .from("trajet")
      .delete()
      .eq("id", trajetId);

    if (deleteError) {
      console.error("Erreur suppression trajet:", deleteError);
      throw new Error("Erreur lors de la suppression du trajet");
    }

    // Revalider les caches
    revalidatePath("/trajets");
    revalidatePath("/");

    return {
      success: true,
      message: "Trajet supprimé avec succès",
    };
  });

/**
 * Action: Mettre à jour les conteneurs d'un trajet
 */
export const updateConteneursAction = action
  .schema(updateConteneursSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const { trajetId, conteneurs } = parsedInput;

    // 1. Supprimer les conteneurs existants
    const { error: deleteError } = await supabase
      .from("conteneur_trajet")
      .delete()
      .eq("trajet_id", trajetId);

    if (deleteError) {
      console.error("Erreur suppression conteneurs:", deleteError);
      throw new Error("Erreur lors de la suppression des conteneurs existants");
    }

    // 2. Créer les nouveaux conteneurs
    const conteneursWithTrajetId = conteneurs.map((c) => ({
      ...c,
      trajet_id: trajetId,
    }));

    const { error: insertError } = await supabase
      .from("conteneur_trajet")
      .insert(conteneursWithTrajetId);

    if (insertError) {
      console.error("Erreur création conteneurs:", insertError);
      throw new Error("Erreur lors de la création des conteneurs");
    }

    // Revalider les caches
    revalidatePath("/trajets");
    revalidatePath(`/trajets/${trajetId}`);

    return {
      success: true,
      message: "Conteneurs mis à jour avec succès",
    };
  });
