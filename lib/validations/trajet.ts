/**
 * Schémas de validation Zod pour les trajets
 *
 * Validation complète des formulaires de création et modification des trajets
 * avec messages d'erreur en français et règles métier.
 */

import { z } from "zod";

/**
 * Schéma de validation pour les conteneurs d'un trajet
 */
export const conteneurSchema = z.object({
  type_conteneur_id: z.string({
    required_error: "Le type de conteneur est requis",
  }).uuid("ID de type conteneur invalide"),
  numero_conteneur: z.string().optional().nullable(),
  quantite: z.number({
    required_error: "La quantité est requise",
  }).int("La quantité doit être un nombre entier")
    .positive("La quantité doit être positive")
    .max(10, "Maximum 10 conteneurs par type"),
  statut_livraison: z.enum(["en_cours", "livre", "retour"], {
    required_error: "Le statut de livraison est requis",
  }),
});

/**
 * Schéma de validation pour la création d'un trajet
 */
export const createTrajetSchema = z.object({
  date_trajet: z.string({
    required_error: "La date du trajet est requise",
  }).refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, "Format de date invalide"),

  chauffeur_id: z.string({
    required_error: "Le chauffeur est requis",
  }).uuid("ID de chauffeur invalide"),

  vehicule_id: z.string({
    required_error: "Le véhicule est requis",
  }).uuid("ID de véhicule invalide"),

  localite_depart_id: z.string({
    required_error: "La localité de départ est requise",
  }).uuid("ID de localité invalide"),

  localite_arrivee_id: z.string({
    required_error: "La localité d'arrivée est requise",
  }).uuid("ID de localité invalide"),

  km_debut: z.number({
    required_error: "Le kilométrage de départ est requis",
  }).nonnegative("Le kilométrage ne peut pas être négatif")
    .int("Le kilométrage doit être un nombre entier"),

  km_fin: z.number({
    required_error: "Le kilométrage de retour est requis",
  }).nonnegative("Le kilométrage ne peut pas être négatif")
    .int("Le kilométrage doit être un nombre entier"),

  litrage_prevu: z.number({
    required_error: "Le litrage prévu est requis",
  }).positive("Le litrage prévu doit être positif")
    .optional()
    .nullable(),

  litrage_station: z.number({
    required_error: "Le litrage acheté est requis",
  }).positive("Le litrage acheté doit être positif")
    .optional()
    .nullable(),

  prix_litre: z.number({
    required_error: "Le prix au litre est requis",
  }).positive("Le prix au litre doit être positif")
    .optional()
    .nullable(),

  frais_peage: z.number()
    .nonnegative("Les frais de péage ne peuvent pas être négatifs")
    .default(0),

  autres_frais: z.number()
    .nonnegative("Les autres frais ne peuvent pas être négatifs")
    .default(0),

  statut: z.enum(["en_cours", "termine", "annule"])
    .default("en_cours"),

  observations: z.string()
    .max(1000, "Les observations ne peuvent pas dépasser 1000 caractères")
    .optional()
    .nullable(),

  conteneurs: z.array(conteneurSchema)
    .min(1, "Au moins un conteneur est requis")
    .max(20, "Maximum 20 conteneurs par trajet"),
}).refine((data) => {
  // Validation: km_fin doit être supérieur à km_debut
  return data.km_fin > data.km_debut;
}, {
  message: "Le kilométrage de retour doit être supérieur au kilométrage de départ",
  path: ["km_fin"],
}).refine((data) => {
  // Validation: localité de départ différente de localité d'arrivée
  return data.localite_depart_id !== data.localite_arrivee_id;
}, {
  message: "La localité de départ doit être différente de la localité d'arrivée",
  path: ["localite_arrivee_id"],
});

/**
 * Schéma de validation pour la modification d'un trajet
 * Tous les champs sont optionnels car on peut modifier partiellement
 */
export const updateTrajetSchema = z.object({
  date_trajet: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, "Format de date invalide").optional(),

  km_debut: z.number()
    .nonnegative("Le kilométrage ne peut pas être négatif")
    .int("Le kilométrage doit être un nombre entier")
    .optional(),

  km_fin: z.number()
    .nonnegative("Le kilométrage ne peut pas être négatif")
    .int("Le kilométrage doit être un nombre entier")
    .optional(),

  litrage_prevu: z.number()
    .positive("Le litrage prévu doit être positif")
    .optional()
    .nullable(),

  litrage_station: z.number()
    .positive("Le litrage acheté doit être positif")
    .optional()
    .nullable(),

  prix_litre: z.number()
    .positive("Le prix au litre doit être positif")
    .optional()
    .nullable(),

  frais_peage: z.number()
    .nonnegative("Les frais de péage ne peuvent pas être négatifs")
    .optional(),

  autres_frais: z.number()
    .nonnegative("Les autres frais ne peuvent pas être négatifs")
    .optional(),

  statut: z.enum(["en_cours", "termine", "annule"])
    .optional(),

  observations: z.string()
    .max(1000, "Les observations ne peuvent pas dépasser 1000 caractères")
    .optional()
    .nullable(),
}).refine((data) => {
  // Validation conditionnelle: si km_debut et km_fin sont fournis, km_fin > km_debut
  if (data.km_debut !== undefined && data.km_fin !== undefined) {
    return data.km_fin > data.km_debut;
  }
  return true;
}, {
  message: "Le kilométrage de retour doit être supérieur au kilométrage de départ",
  path: ["km_fin"],
});

/**
 * Schéma pour les filtres de recherche de trajets
 */
export const trajetFiltersSchema = z.object({
  chauffeur_id: z.string().uuid().optional(),
  vehicule_id: z.string().uuid().optional(),
  localite_arrivee_id: z.string().uuid().optional(),
  date_debut: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, "Format de date invalide").optional(),
  date_fin: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, "Format de date invalide").optional(),
  statut: z.enum(["en_cours", "termine", "annule"]).optional(),
  search: z.string().optional(), // Recherche texte libre
});

/**
 * Types TypeScript inférés des schémas
 */
export type CreateTrajetInput = z.infer<typeof createTrajetSchema>;
export type UpdateTrajetInput = z.infer<typeof updateTrajetSchema>;
export type TrajetFilters = z.infer<typeof trajetFiltersSchema>;
export type ConteneurInput = z.infer<typeof conteneurSchema>;

/**
 * Fonctions de calcul pour les trajets
 * Ces calculs sont effectués côté client pour affichage en temps réel
 */
export const trajetCalculations = {
  /**
   * Calcule la distance parcourue
   */
  calculerDistance: (km_debut: number, km_fin: number): number => {
    return Math.max(0, km_fin - km_debut);
  },

  /**
   * Calcule l'écart de litrage
   */
  calculerEcartLitrage: (
    litrage_prevu: number | null,
    litrage_station: number | null
  ): number | null => {
    if (litrage_prevu === null || litrage_station === null) return null;
    return litrage_station - litrage_prevu;
  },

  /**
   * Calcule le prix au litre
   */
  calculerPrixLitre: (
    montant_carburant: number | null,
    litrage_station: number | null
  ): number | null => {
    if (montant_carburant === null || litrage_station === null || litrage_station === 0) {
      return null;
    }
    return montant_carburant / litrage_station;
  },

  /**
   * Calcule la consommation au 100 km
   */
  calculerConsommationAu100: (
    litrage_station: number | null,
    distance: number
  ): number | null => {
    if (litrage_station === null || distance === 0) return null;
    return (litrage_station / distance) * 100;
  },

  /**
   * Calcule le coût total du trajet
   */
  calculerCoutTotal: (
    montant_carburant: number | null,
    frais_peage: number,
    autres_frais: number
  ): number => {
    return (montant_carburant || 0) + frais_peage + autres_frais;
  },

  /**
   * Vérifie si une alerte d'écart carburant doit être déclenchée
   */
  verifierAlerteEcartCarburant: (ecart_litrage: number | null): boolean => {
    if (ecart_litrage === null) return false;
    return Math.abs(ecart_litrage) > 10;
  },

  /**
   * Vérifie si une alerte de consommation anormale doit être déclenchée
   * @param consommation_actuelle Consommation du trajet actuel
   * @param consommation_moyenne Consommation moyenne du véhicule
   */
  verifierAlerteConsommationAnormale: (
    consommation_actuelle: number | null,
    consommation_moyenne: number | null
  ): boolean => {
    if (consommation_actuelle === null || consommation_moyenne === null) return false;
    // Alerte si +30% au-dessus de la moyenne
    return consommation_actuelle > consommation_moyenne * 1.3;
  },
};
