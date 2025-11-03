import { z } from 'zod'

/**
 * Validation schema pour la création d'un sous-traitant
 */
export const createSousTraitantSchema = z.object({
  nom_entreprise: z
    .string()
    .min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères")
    .max(200, "Le nom de l'entreprise ne peut pas dépasser 200 caractères"),

  contact_principal: z
    .string()
    .min(2, 'Le nom du contact doit contenir au moins 2 caractères')
    .max(100, 'Le nom du contact ne peut pas dépasser 100 caractères')
    .optional(),

  telephone: z
    .string()
    .regex(
      /^\+225\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/,
      'Le numéro doit être au format ivoirien: +225 XX XX XX XX XX'
    )
    .optional()
    .or(z.literal('')),

  email: z
    .string()
    .email('Adresse email invalide')
    .max(100, "L'email ne peut pas dépasser 100 caractères")
    .optional()
    .or(z.literal('')),

  adresse: z
    .string()
    .max(500, "L'adresse ne peut pas dépasser 500 caractères")
    .optional()
    .or(z.literal('')),

  statut: z
    .enum(['actif', 'inactif', 'blackliste'], {
      errorMap: () => ({ message: 'Statut invalide' }),
    }),
})

/**
 * Validation schema pour la mise à jour d'un sous-traitant
 */
export const updateSousTraitantSchema = createSousTraitantSchema.partial()

/**
 * Type TypeScript pour la création d'un sous-traitant
 */
export type CreateSousTraitantInput = z.infer<typeof createSousTraitantSchema>

/**
 * Type TypeScript pour la mise à jour d'un sous-traitant
 */
export type UpdateSousTraitantInput = z.infer<typeof updateSousTraitantSchema>

/**
 * Schema pour les filtres de recherche de sous-traitants
 */
export const sousTraitantFiltersSchema = z.object({
  search: z.string().optional(),
  statut: z.enum(['actif', 'inactif', 'blackliste', 'tous']).optional(),
})

/**
 * Type pour les filtres de sous-traitants
 */
export type SousTraitantFilters = z.infer<typeof sousTraitantFiltersSchema>

// ===================================
// MISSION_SOUS_TRAITANCE - Validations
// ===================================

/**
 * Schéma de validation pour la création d'une mission de sous-traitance
 */
export const createMissionSousTraitanceSchema = z
  .object({
    sous_traitant_id: z.string().uuid("ID du sous-traitant invalide"),
    date_mission: z.string().or(z.date()),
    localite_depart_id: z.string().uuid("Localité de départ invalide"),
    localite_arrivee_id: z.string().uuid("Localité d'arrivée invalide"),
    type_conteneur_id: z.string().uuid("Type de conteneur invalide"),
    numero_conteneur: z
      .string()
      .max(50, "Le numéro de conteneur ne peut pas dépasser 50 caractères")
      .optional()
      .or(z.literal("")),
    quantite: z
      .number()
      .int("La quantité doit être un nombre entier")
      .min(1, "La quantité doit être d'au moins 1")
      .max(20, "La quantité ne peut pas dépasser 20 conteneurs")
      .default(1),
    montant_total: z
      .number()
      .min(0, "Le montant total doit être positif")
      .max(100000000, "Le montant total ne peut pas dépasser 100 000 000 XOF"),
    avance_payee: z.boolean().default(false),
    solde_paye: z.boolean().default(false),
    date_paiement_avance: z.string().or(z.date()).optional().nullable(),
    date_paiement_solde: z.string().or(z.date()).optional().nullable(),
    statut: z.enum(["en_cours", "terminee", "annulee"]).default("en_cours"),
    observations: z
      .string()
      .max(1000, "Les observations ne peuvent pas dépasser 1000 caractères")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.localite_depart_id !== data.localite_arrivee_id, {
    message: "La localité de départ et d'arrivée doivent être différentes",
    path: ["localite_arrivee_id"],
  })
  .refine(
    (data) => {
      // Si l'avance est payée, la date de paiement d'avance doit être renseignée
      if (data.avance_payee && !data.date_paiement_avance) {
        return false;
      }
      return true;
    },
    {
      message:
        "La date de paiement d'avance est requise si l'avance est marquée comme payée",
      path: ["date_paiement_avance"],
    }
  )
  .refine(
    (data) => {
      // Si le solde est payé, la date de paiement de solde doit être renseignée
      if (data.solde_paye && !data.date_paiement_solde) {
        return false;
      }
      return true;
    },
    {
      message:
        "La date de paiement de solde est requise si le solde est marqué comme payé",
      path: ["date_paiement_solde"],
    }
  )
  .refine(
    (data) => {
      // Si le solde est payé, l'avance doit aussi être payée
      if (data.solde_paye && !data.avance_payee) {
        return false;
      }
      return true;
    },
    {
      message: "L'avance doit être payée avant le solde",
      path: ["solde_paye"],
    }
  );

/**
 * Schéma de validation pour la mise à jour d'une mission de sous-traitance
 * Note: Les refinements de validation sont allégés pour l'update (pas de validation stricte des paiements)
 */
export const updateMissionSousTraitanceSchema = z
  .object({
    sous_traitant_id: z.string().uuid("ID du sous-traitant invalide").optional(),
    date_mission: z.string().or(z.date()).optional(),
    localite_depart_id: z.string().uuid("Localité de départ invalide").optional(),
    localite_arrivee_id: z.string().uuid("Localité d'arrivée invalide").optional(),
    type_conteneur_id: z.string().uuid("Type de conteneur invalide").optional(),
    numero_conteneur: z
      .string()
      .max(50, "Le numéro de conteneur ne peut pas dépasser 50 caractères")
      .optional()
      .or(z.literal("")),
    quantite: z
      .number()
      .int("La quantité doit être un nombre entier")
      .min(1, "La quantité doit être d'au moins 1")
      .max(20, "La quantité ne peut pas dépasser 20 conteneurs")
      .optional(),
    montant_total: z
      .number()
      .min(0, "Le montant total doit être positif")
      .max(100000000, "Le montant total ne peut pas dépasser 100 000 000 XOF")
      .optional(),
    avance_payee: z.boolean().optional(),
    solde_paye: z.boolean().optional(),
    date_paiement_avance: z.string().or(z.date()).optional().nullable(),
    date_paiement_solde: z.string().or(z.date()).optional().nullable(),
    statut: z.enum(["en_cours", "terminee", "annulee"]).optional(),
    observations: z
      .string()
      .max(1000, "Les observations ne peuvent pas dépasser 1000 caractères")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      // Vérifier que départ != arrivée seulement si les deux sont fournis
      if (data.localite_depart_id && data.localite_arrivee_id) {
        return data.localite_depart_id !== data.localite_arrivee_id;
      }
      return true;
    },
    {
      message: "La localité de départ et d'arrivée doivent être différentes",
      path: ["localite_arrivee_id"],
    }
  );

/**
 * Schéma de validation pour les filtres de recherche de missions
 */
export const missionSousTraitanceFiltersSchema = z.object({
  sous_traitant_id: z.string().uuid().optional(),
  date_debut: z.string().optional(),
  date_fin: z.string().optional(),
  localite_depart_id: z.string().uuid().optional(),
  localite_arrivee_id: z.string().uuid().optional(),
  statut: z.enum(["en_cours", "terminee", "annulee"]).optional(),
  paiement_statut: z
    .enum(["non_paye", "avance_payee", "complet"])
    .optional(),
});

// ===================================
// Types TypeScript pour les missions
// ===================================

export type CreateMissionSousTraitanceInput = z.infer<
  typeof createMissionSousTraitanceSchema
>;
export type UpdateMissionSousTraitanceInput = z.infer<
  typeof updateMissionSousTraitanceSchema
>;
export type MissionSousTraitanceFilters = z.infer<
  typeof missionSousTraitanceFiltersSchema
>;
