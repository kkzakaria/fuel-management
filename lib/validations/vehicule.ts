/**
 * Schémas de validation Zod pour les véhicules
 *
 * Validation complète des formulaires de création et modification des véhicules
 * avec messages d'erreur en français et règles métier.
 */

import { z } from "zod";

/**
 * Schéma de validation pour la création d'un véhicule
 */
export const createVehiculeSchema = z.object({
  immatriculation: z
    .string({
      required_error: "L'immatriculation est requise",
    })
    .min(5, "L'immatriculation doit contenir au moins 5 caractères")
    .max(20, "L'immatriculation ne peut pas dépasser 20 caractères")
    .trim()
    .toUpperCase(),

  marque: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        return val.trim().length >= 2;
      },
      {
        message: "La marque doit contenir au moins 2 caractères",
      }
    ),

  modele: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        return val.trim().length >= 2;
      },
      {
        message: "Le modèle doit contenir au moins 2 caractères",
      }
    ),

  annee: z
    .number({
      invalid_type_error: "L'année doit être un nombre",
    })
    .int("L'année doit être un nombre entier")
    .min(1900, "L'année doit être supérieure à 1900")
    .max(new Date().getFullYear() + 1, "L'année ne peut pas être dans le futur")
    .optional()
    .nullable(),

  type_carburant: z.enum(["gasoil", "essence", "hybride", "electrique"], {
    required_error: "Le type de carburant est requis",
  }),

  kilometrage_actuel: z
    .number({
      invalid_type_error: "Le kilométrage doit être un nombre",
    })
    .int("Le kilométrage doit être un nombre entier")
    .min(0, "Le kilométrage ne peut pas être négatif")
    .max(2000000, "Kilométrage invalide"),

  statut: z.enum(["actif", "maintenance", "inactif", "vendu"], {
    required_error: "Le statut est requis",
  }),
});

/**
 * Schéma de validation pour la modification d'un véhicule
 */
export const updateVehiculeSchema = createVehiculeSchema.partial();

/**
 * Schéma de validation pour la suppression d'un véhicule
 */
export const deleteVehiculeSchema = z.object({
  vehicule_id: z.string().uuid("ID de véhicule invalide"),
});

/**
 * Schéma de validation pour les filtres de recherche
 */
export const vehiculeFiltersSchema = z.object({
  statut: z.enum(["actif", "maintenance", "inactif", "vendu"]).optional(),
  type_carburant: z.enum(["gasoil", "essence", "hybride", "electrique"]).optional(),
  search: z.string().optional(),
});

/**
 * Types inférés depuis les schémas
 */
export type CreateVehiculeInput = z.infer<typeof createVehiculeSchema>;
export type UpdateVehiculeInput = z.infer<typeof updateVehiculeSchema>;
export type DeleteVehiculeInput = z.infer<typeof deleteVehiculeSchema>;
export type VehiculeFilters = z.infer<typeof vehiculeFiltersSchema>;
