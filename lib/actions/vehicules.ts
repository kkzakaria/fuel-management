/**
 * Server Actions pour la gestion des véhicules
 *
 * Actions serveur sécurisées avec next-safe-action pour:
 * - Création de véhicules
 * - Modification de véhicules
 * - Suppression de véhicules
 */

"use server";

import { revalidatePath } from "next/cache";
import { action } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";
import {
  createVehiculeSchema,
  updateVehiculeSchema,
  deleteVehiculeSchema,
} from "@/lib/validations/vehicule";

/**
 * Action: Créer un nouveau véhicule
 */
export const createVehiculeAction = action
  .schema(createVehiculeSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    // Vérifier si l'immatriculation existe déjà
    const { data: existing } = await supabase
      .from("vehicule")
      .select("id")
      .eq("immatriculation", parsedInput.immatriculation.toUpperCase())
      .single();

    if (existing) {
      throw new Error("Cette immatriculation est déjà utilisée");
    }

    // Créer le véhicule
    const { data: vehicule, error } = await supabase
      .from("vehicule")
      .insert({
        ...parsedInput,
        immatriculation: parsedInput.immatriculation.toUpperCase(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur création véhicule:", error);
      throw new Error("Erreur lors de la création du véhicule");
    }

    // Revalider les caches
    revalidatePath("/vehicules");
    revalidatePath("/");

    return {
      success: true,
      vehiculeId: vehicule.id,
      message: "Véhicule créé avec succès",
    };
  });

/**
 * Action: Mettre à jour un véhicule existant
 */
export const updateVehiculeAction = action
  .schema(updateVehiculeSchema)
  .bindArgsSchemas([deleteVehiculeSchema])
  .action(async ({ parsedInput, bindArgsParsedInputs: [{ vehicule_id }] }) => {
    const supabase = await createClient();

    // Vérifier si l'immatriculation existe déjà (si modifiée)
    if (parsedInput.immatriculation) {
      const { data: existing } = await supabase
        .from("vehicule")
        .select("id")
        .eq("immatriculation", parsedInput.immatriculation.toUpperCase())
        .neq("id", vehicule_id)
        .single();

      if (existing) {
        throw new Error("Cette immatriculation est déjà utilisée par un autre véhicule");
      }
    }

    // Mettre à jour le véhicule
    const updateData = parsedInput.immatriculation
      ? { ...parsedInput, immatriculation: parsedInput.immatriculation.toUpperCase() }
      : parsedInput;

    const { data, error } = await supabase
      .from("vehicule")
      .update(updateData)
      .eq("id", vehicule_id)
      .select()
      .single();

    if (error) {
      console.error("Erreur mise à jour véhicule:", error);
      throw new Error("Erreur lors de la mise à jour du véhicule");
    }

    if (!data) {
      throw new Error("Véhicule non trouvé");
    }

    // Revalider les caches
    revalidatePath("/vehicules");
    revalidatePath(`/vehicules/${vehicule_id}`);
    revalidatePath("/");

    return {
      success: true,
      vehiculeId: data.id,
      message: "Véhicule modifié avec succès",
    };
  });

/**
 * Action: Supprimer un véhicule
 * Note: Vérifie d'abord si le véhicule a des trajets associés
 */
export const deleteVehiculeAction = action
  .schema(deleteVehiculeSchema)
  .action(async ({ parsedInput: { vehicule_id } }) => {
    const supabase = await createClient();

    // Vérifier s'il y a des trajets associés
    const { data: trajets, error: trajetsError } = await supabase
      .from("trajet")
      .select("id", { count: "exact", head: true })
      .eq("vehicule_id", vehicule_id);

    if (trajetsError) {
      console.error("Erreur vérification trajets:", trajetsError);
      throw new Error("Erreur lors de la vérification des trajets");
    }

    // Empêcher la suppression si le véhicule a des trajets
    if (trajets && trajets.length > 0) {
      throw new Error(
        "Impossible de supprimer ce véhicule car il a des trajets associés. Changez son statut en 'inactif' ou 'vendu' à la place."
      );
    }

    // Supprimer le véhicule
    const { error: deleteError } = await supabase
      .from("vehicule")
      .delete()
      .eq("id", vehicule_id);

    if (deleteError) {
      console.error("Erreur suppression véhicule:", deleteError);
      throw new Error("Erreur lors de la suppression du véhicule");
    }

    // Revalider les caches
    revalidatePath("/vehicules");
    revalidatePath("/");

    return {
      success: true,
      message: "Véhicule supprimé avec succès",
    };
  });
