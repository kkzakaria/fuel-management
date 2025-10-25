import { z } from 'zod'

/**
 * Base schema pour les missions (sans refine)
 */
const baseMissionSchema = z.object({
  sous_traitant_id: z
    .string()
    .uuid('ID sous-traitant invalide'),

  date_mission: z
    .date({
      required_error: 'La date de mission est requise',
      invalid_type_error: 'Date invalide',
    }),

  localite_depart_id: z
    .string()
    .uuid('Localité de départ invalide'),

  localite_arrivee_id: z
    .string()
    .uuid("Localité d'arrivée invalide"),

  type_conteneur_id: z
    .string()
    .uuid('Type de conteneur invalide'),

  numero_conteneur: z
    .string()
    .min(1, 'Le numéro de conteneur est requis')
    .max(50, 'Le numéro ne peut pas dépasser 50 caractères')
    .optional()
    .or(z.literal('')),

  quantite: z
    .number({
      required_error: 'La quantité est requise',
      invalid_type_error: 'La quantité doit être un nombre',
    })
    .int('La quantité doit être un nombre entier')
    .positive('La quantité doit être positive')
    .min(1, 'La quantité minimale est 1')
    .max(20, 'La quantité maximale est 20'),

  montant_total: z
    .number({
      required_error: 'Le montant total est requis',
      invalid_type_error: 'Le montant doit être un nombre',
    })
    .nonnegative('Le montant ne peut pas être négatif')
    .min(0, 'Le montant minimum est 0')
    .max(100000000, 'Le montant maximum est 100 000 000 XOF'),

  statut: z
    .enum(['en_cours', 'terminee', 'annulee'], {
      errorMap: () => ({ message: 'Statut invalide' }),
    }),

  observations: z
    .string()
    .max(1000, 'Les observations ne peuvent pas dépasser 1000 caractères')
    .optional()
    .or(z.literal('')),
})

/**
 * Validation schema pour la création d'une mission de sous-traitance
 */
export const createMissionSchema = baseMissionSchema
  .refine(
    (data) => data.localite_depart_id !== data.localite_arrivee_id,
    {
      message: 'La localité de départ et d\'arrivée doivent être différentes',
      path: ['localite_arrivee_id'],
    }
  )

/**
 * Validation schema pour la mise à jour d'une mission
 */
export const updateMissionSchema = baseMissionSchema.partial()

/**
 * Validation schema pour le paiement d'une mission
 */
export const paymentMissionSchema = z.object({
  avance_payee: z.boolean().optional(),
  solde_paye: z.boolean().optional(),
  date_paiement_avance: z.date().optional().nullable(),
  date_paiement_solde: z.date().optional().nullable(),
})

/**
 * Type TypeScript pour la création d'une mission
 */
export type CreateMissionInput = z.infer<typeof createMissionSchema>

/**
 * Type TypeScript pour la mise à jour d'une mission
 */
export type UpdateMissionInput = z.infer<typeof updateMissionSchema>

/**
 * Type TypeScript pour le paiement d'une mission
 */
export type PaymentMissionInput = z.infer<typeof paymentMissionSchema>

/**
 * Schema pour les filtres de recherche de missions
 */
export const missionFiltersSchema = z.object({
  search: z.string().optional(),
  sous_traitant_id: z.string().uuid().optional(),
  statut: z.enum(['en_cours', 'terminee', 'annulee', 'tous']).optional(),
  statut_paiement: z.enum(['en_attente', 'partiel', 'complet', 'tous']).optional(),
  date_debut: z.date().optional(),
  date_fin: z.date().optional(),
})

/**
 * Type pour les filtres de missions
 */
export type MissionFilters = z.infer<typeof missionFiltersSchema>

/**
 * Calcule le statut de paiement d'une mission
 */
export function calculatePaymentStatus(
  avance_payee: boolean,
  solde_paye: boolean
): 'en_attente' | 'partiel' | 'complet' {
  if (solde_paye && avance_payee) return 'complet'
  if (avance_payee) return 'partiel'
  return 'en_attente'
}
