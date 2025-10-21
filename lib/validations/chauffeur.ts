/**
 * Schémas de validation Zod pour les chauffeurs
 *
 * Validation complète des formulaires de création et modification des chauffeurs
 * avec messages d'erreur en français et règles métier.
 */

import { z } from "zod";

/**
 * Schéma de validation pour la création d'un chauffeur
 */
export const createChauffeurSchema = z.object({
  nom: z
    .string({
      required_error: "Le nom est requis",
    })
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .trim(),

  prenom: z
    .string({
      required_error: "Le prénom est requis",
    })
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(100, "Le prénom ne peut pas dépasser 100 caractères")
    .trim(),

  telephone: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        // Format ivoirien: +225 ou 225 suivi de 10 chiffres OU 10 chiffres directement
        const phoneRegex = /^(\+?225)?[0-9]{10}$/;
        return phoneRegex.test(val.replace(/\s/g, ""));
      },
      {
        message: "Format de téléphone invalide (ex: +225 0123456789 ou 0123456789)",
      }
    ),

  numero_permis: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        return val.trim().length >= 5;
      },
      {
        message: "Le numéro de permis doit contenir au moins 5 caractères",
      }
    ),

  date_embauche: z
    .string()
    .optional()
    .nullable()
    .refine(
      (date) => {
        if (!date) return true;
        const d = new Date(date);
        return !isNaN(d.getTime()) && d <= new Date();
      },
      "La date d'embauche ne peut pas être dans le futur"
    ),

  statut: z.enum(["actif", "inactif", "suspendu"], {
    required_error: "Le statut est requis",
  }),
});

/**
 * Schéma de validation pour la modification d'un chauffeur
 */
export const updateChauffeurSchema = createChauffeurSchema.partial();

/**
 * Schéma de validation pour la suppression d'un chauffeur
 */
export const deleteChauffeurSchema = z.object({
  chauffeur_id: z.string().uuid("ID de chauffeur invalide"),
});

/**
 * Schéma de validation pour les filtres de recherche
 */
export const chauffeurFiltersSchema = z.object({
  statut: z.enum(["actif", "inactif", "suspendu"]).optional(),
  search: z.string().optional(),
});

/**
 * Types inférés depuis les schémas
 */
export type CreateChauffeurInput = z.infer<typeof createChauffeurSchema>;
export type UpdateChauffeurInput = z.infer<typeof updateChauffeurSchema>;
export type DeleteChauffeurInput = z.infer<typeof deleteChauffeurSchema>;
export type ChauffeurFilters = z.infer<typeof chauffeurFiltersSchema>;
