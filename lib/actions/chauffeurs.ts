/**
 * Server Actions pour la gestion des chauffeurs
 *
 * Actions serveur sécurisées avec next-safe-action pour:
 * - Création de chauffeurs
 * - Modification de chauffeurs
 * - Suppression de chauffeurs
 */

"use server";

import { revalidatePath } from "next/cache";
import { action } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";
import {
  createChauffeurSchema,
  updateChauffeurSchema,
  deleteChauffeurSchema,
} from "@/lib/validations/chauffeur";

/**
 * Action: Créer un nouveau chauffeur
 */
export const createChauffeurAction = action
  .schema(createChauffeurSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    // Vérifier si le numéro de permis existe déjà (si fourni)
    if (parsedInput.numero_permis) {
      const { data: existing } = await supabase
        .from("chauffeur")
        .select("id")
        .eq("numero_permis", parsedInput.numero_permis)
        .single();

      if (existing) {
        throw new Error("Ce numéro de permis est déjà utilisé");
      }
    }

    // Créer le chauffeur
    const { data: chauffeur, error } = await supabase
      .from("chauffeur")
      .insert(parsedInput)
      .select()
      .single();

    if (error) {
      console.error("Erreur création chauffeur:", error);
      throw new Error("Erreur lors de la création du chauffeur");
    }

    // Revalider les caches
    revalidatePath("/chauffeurs");
    revalidatePath("/");

    return {
      success: true,
      chauffeurId: chauffeur.id,
      message: "Chauffeur créé avec succès",
    };
  });

/**
 * Action: Mettre à jour un chauffeur existant
 */
export const updateChauffeurAction = action
  .schema(updateChauffeurSchema)
  .bindArgsSchemas([deleteChauffeurSchema])
  .action(async ({ parsedInput, bindArgsParsedInputs: [{ chauffeur_id }] }) => {
    const supabase = await createClient();

    // Vérifier si le numéro de permis existe déjà (si modifié)
    if (parsedInput.numero_permis) {
      const { data: existing } = await supabase
        .from("chauffeur")
        .select("id")
        .eq("numero_permis", parsedInput.numero_permis)
        .neq("id", chauffeur_id)
        .single();

      if (existing) {
        throw new Error("Ce numéro de permis est déjà utilisé par un autre chauffeur");
      }
    }

    // Mettre à jour le chauffeur
    const { data, error } = await supabase
      .from("chauffeur")
      .update(parsedInput)
      .eq("id", chauffeur_id)
      .select()
      .single();

    if (error) {
      console.error("Erreur mise à jour chauffeur:", error);
      throw new Error("Erreur lors de la mise à jour du chauffeur");
    }

    if (!data) {
      throw new Error("Chauffeur non trouvé");
    }

    // Revalider les caches
    revalidatePath("/chauffeurs");
    revalidatePath(`/chauffeurs/${chauffeur_id}`);
    revalidatePath("/");

    return {
      success: true,
      chauffeurId: data.id,
      message: "Chauffeur modifié avec succès",
    };
  });

/**
 * Action: Supprimer un chauffeur
 * Note: Vérifie d'abord si le chauffeur a des trajets associés
 */
export const deleteChauffeurAction = action
  .schema(deleteChauffeurSchema)
  .action(async ({ parsedInput: { chauffeur_id } }) => {
    const supabase = await createClient();

    // Vérifier s'il y a des trajets associés
    const { data: trajets, error: trajetsError } = await supabase
      .from("trajet")
      .select("id", { count: "exact", head: true })
      .eq("chauffeur_id", chauffeur_id);

    if (trajetsError) {
      console.error("Erreur vérification trajets:", trajetsError);
      throw new Error("Erreur lors de la vérification des trajets");
    }

    // Empêcher la suppression si le chauffeur a des trajets
    if (trajets && trajets.length > 0) {
      throw new Error(
        "Impossible de supprimer ce chauffeur car il a des trajets associés. Changez son statut en 'inactif' à la place."
      );
    }

    // Supprimer le chauffeur
    const { error: deleteError } = await supabase
      .from("chauffeur")
      .delete()
      .eq("id", chauffeur_id);

    if (deleteError) {
      console.error("Erreur suppression chauffeur:", deleteError);
      throw new Error("Erreur lors de la suppression du chauffeur");
    }

    // Revalider les caches
    revalidatePath("/chauffeurs");
    revalidatePath("/");

    return {
      success: true,
      message: "Chauffeur supprimé avec succès",
    };
  });
