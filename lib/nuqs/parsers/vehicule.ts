/**
 * Parsers Nuqs pour la page Véhicules
 * Gère 3 paramètres: statut, type_carburant, search
 */

import { createEnumSearchParam } from "../serializers/enum";
import { paginationSearchParams, searchSearchParam } from "../hooks";

// Enum pour le statut des véhicules
const VEHICULE_STATUT_VALUES = [
  "actif",
  "maintenance",
  "inactif",
  "vendu",
] as const;

// Enum pour le type de carburant
const TYPE_CARBURANT_VALUES = [
  "gasoil",
  "essence",
  "hybride",
  "electrique",
] as const;

/**
 * Définition des paramètres URL pour la page Véhicules
 */
export const vehiculeSearchParams = {
  // Filtre de statut
  statut: createEnumSearchParam(VEHICULE_STATUT_VALUES),

  // Filtre de type de carburant
  type_carburant: createEnumSearchParam(TYPE_CARBURANT_VALUES),

  // Recherche textuelle
  ...searchSearchParam,

  // Pagination
  ...paginationSearchParams,
};

/**
 * Type pour les paramètres de véhicule
 */
export type VehiculeSearchParams = {
  statut: (typeof VEHICULE_STATUT_VALUES)[number] | null;
  type_carburant: (typeof TYPE_CARBURANT_VALUES)[number] | null;
  search: string;
  page: number;
  pageSize: number;
};

/**
 * Convertit les search params Nuqs vers le format VehiculeFilters de l'API
 */
export function vehiculeSearchParamsToFilters(
  params: Partial<VehiculeSearchParams>
): Record<string, string | undefined> {
  const filters: Record<string, string | undefined> = {};

  if (params.statut) filters["statut"] = params.statut;
  if (params.type_carburant) filters["type_carburant"] = params.type_carburant;
  if (params.search) filters["search"] = params.search;

  return filters;
}
