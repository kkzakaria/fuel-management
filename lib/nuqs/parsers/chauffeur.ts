/**
 * Parsers Nuqs pour la page Chauffeurs
 * Gère 2 paramètres: statut, search
 */

import { createEnumSearchParam } from "../serializers/enum";
import { paginationSearchParams, searchSearchParam } from "../hooks";

// Enum pour le statut des chauffeurs
const CHAUFFEUR_STATUT_VALUES = ["actif", "inactif", "suspendu"] as const;

/**
 * Définition des paramètres URL pour la page Chauffeurs
 */
export const chauffeurSearchParams = {
  // Filtre de statut
  statut: createEnumSearchParam(CHAUFFEUR_STATUT_VALUES),

  // Recherche textuelle
  ...searchSearchParam,

  // Pagination
  ...paginationSearchParams,
};

/**
 * Type pour les paramètres de chauffeur
 */
export type ChauffeurSearchParams = {
  statut: (typeof CHAUFFEUR_STATUT_VALUES)[number] | null;
  search: string;
  page: number;
  pageSize: number;
};

/**
 * Convertit les search params Nuqs vers le format ChauffeurFilters de l'API
 */
export function chauffeurSearchParamsToFilters(
  params: Partial<ChauffeurSearchParams>
): Record<string, string | undefined> {
  const filters: Record<string, string | undefined> = {};

  if (params.statut) filters["statut"] = params.statut;
  if (params.search) filters["search"] = params.search;

  return filters;
}
