/**
 * Parsers Nuqs pour la page Trajets
 * Gère 7 paramètres: chauffeurIds, vehiculeIds, localiteArriveeIds, dateDebut, dateFin, statut, search
 * Note: Les IDs sont maintenant des arrays pour supporter la sélection multiple
 */

import { createUuidArraySearchParam } from "../serializers/uuid";
import { createDateStringSearchParam } from "../serializers/date";
import { createEnumSearchParam } from "../serializers/enum";
import { paginationSearchParams, searchSearchParam } from "../hooks";

// Enum pour le statut des trajets
const TRAJET_STATUT_VALUES = ["en_cours", "termine", "annule"] as const;

/**
 * Définition des paramètres URL pour la page Trajets
 */
export const trajetSearchParams = {
  // Filtres de relation (UUIDs multiples)
  chauffeurIds: createUuidArraySearchParam(),
  vehiculeIds: createUuidArraySearchParam(),
  localiteArriveeIds: createUuidArraySearchParam(),

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
  chauffeurIds: string[];
  vehiculeIds: string[];
  localiteArriveeIds: string[];
  dateDebut: string | null;
  dateFin: string | null;
  statut: (typeof TRAJET_STATUT_VALUES)[number] | null;
  search: string;
  page: number;
  pageSize: number;
};

/**
 * Convertit les search params Nuqs vers le format TrajetFilters de l'API
 * Joint les arrays d'IDs en strings séparées par des virgules
 */
export function trajetSearchParamsToFilters(
  params: Partial<TrajetSearchParams>
): Record<string, string | undefined> {
  const filters: Record<string, string | undefined> = {};

  if (params.chauffeurIds && params.chauffeurIds.length > 0)
    filters["chauffeur_id"] = params.chauffeurIds.join(",");
  if (params.vehiculeIds && params.vehiculeIds.length > 0)
    filters["vehicule_id"] = params.vehiculeIds.join(",");
  if (params.localiteArriveeIds && params.localiteArriveeIds.length > 0)
    filters["localite_arrivee_id"] = params.localiteArriveeIds.join(",");
  if (params.dateDebut) filters["date_debut"] = params.dateDebut;
  if (params.dateFin) filters["date_fin"] = params.dateFin;
  if (params.statut) filters["statut"] = params.statut;
  if (params.search) filters["search"] = params.search;

  return filters;
}
