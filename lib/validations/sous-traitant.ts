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
