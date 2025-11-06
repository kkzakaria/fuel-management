/**
 * Parsers Nuqs pour la page Sous-traitants
 * Gère 1 paramètre: statut
 */

import { createEnumSearchParam } from "../serializers/enum";
import { paginationSearchParams, searchSearchParam } from "../hooks";

// Enum pour le statut des sous-traitants
const SOUS_TRAITANT_STATUT_VALUES = [
  "actif",
  "inactif",
  "blackliste",
] as const;

/**
 * Définition des paramètres URL pour la page Sous-traitants
 */
export const sousTraitantSearchParams = {
  // Filtre de statut
  statut: createEnumSearchParam(SOUS_TRAITANT_STATUT_VALUES),

  // Recherche textuelle (probablement ajoutée dans le DataTable)
  ...searchSearchParam,

  // Pagination
  ...paginationSearchParams,
};

/**
 * Type pour les paramètres de sous-traitant
 */
export type SousTraitantSearchParams = {
  statut: (typeof SOUS_TRAITANT_STATUT_VALUES)[number] | null;
  search: string;
  page: number;
  pageSize: number;
};

/**
 * Convertit les search params Nuqs vers le format SousTraitantFilters de l'API
 */
export function sousTraitantSearchParamsToFilters(
  params: Partial<SousTraitantSearchParams>
): Record<string, string | undefined> {
  const filters: Record<string, string | undefined> = {};

  if (params.statut) filters["statut"] = params.statut;
  if (params.search) filters["search"] = params.search;

  return filters;
}
