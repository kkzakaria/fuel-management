/**
 * Parsers Nuqs pour la page Trajets
 * Gère 7 paramètres: chauffeurId, vehiculeId, localiteArriveeId, dateDebut, dateFin, statut, search
 */

import { createUuidSearchParam } from "../serializers/uuid";
import { createDateStringSearchParam } from "../serializers/date";
import { createEnumSearchParam } from "../serializers/enum";
import { paginationSearchParams, searchSearchParam } from "../hooks";

// Enum pour le statut des trajets
const TRAJET_STATUT_VALUES = ["en_cours", "termine", "annule"] as const;

/**
 * Définition des paramètres URL pour la page Trajets
 */
export const trajetSearchParams = {
  // Filtres de relation (UUIDs)
  chauffeurId: createUuidSearchParam(),
  vehiculeId: createUuidSearchParam(),
  localiteArriveeId: createUuidSearchParam(),

  // Filtres de date (format ISO string pour compatibilité avec API)
  dateDebut: createDateStringSearchParam(),
  dateFin: createDateStringSearchParam(),

  // Filtre de statut (enum type-safe)
  statut: createEnumSearchParam(TRAJET_STATUT_VALUES),

  // Recherche textuelle
  ...searchSearchParam,

  // Pagination (pour mode desktop et infinite scroll)
  ...paginationSearchParams,
};

/**
 * Type pour les filtres de trajet (compatible avec l'API existante)
 */
export type TrajetSearchParams = {
  chauffeurId: string | null;
  vehiculeId: string | null;
  localiteArriveeId: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  statut: (typeof TRAJET_STATUT_VALUES)[number] | null;
  search: string;
  page: number;
  pageSize: number;
};

/**
 * Convertit les search params Nuqs vers le format TrajetFilters de l'API
 * Supprime les valeurs null/undefined pour correspondre au format attendu
 */
export function trajetSearchParamsToFilters(
  params: Partial<TrajetSearchParams>
): Record<string, string | undefined> {
  const filters: Record<string, string | undefined> = {};

  if (params.chauffeurId) filters["chauffeur_id"] = params.chauffeurId;
  if (params.vehiculeId) filters["vehicule_id"] = params.vehiculeId;
  if (params.localiteArriveeId)
    filters["localite_arrivee_id"] = params.localiteArriveeId;
  if (params.dateDebut) filters["date_debut"] = params.dateDebut;
  if (params.dateFin) filters["date_fin"] = params.dateFin;
  if (params.statut) filters["statut"] = params.statut;
  if (params.search) filters["search"] = params.search;

  return filters;
}
