/**
 * Parsers Nuqs pour la page Missions sous-traitance
 * Gère principalement la pagination avec des filtres optionnels
 */

import { createUuidSearchParam } from "../serializers/uuid";
import { createEnumSearchParam } from "../serializers/enum";
import { createDateStringSearchParam } from "../serializers/date";
import { paginationSearchParams, searchSearchParam } from "../hooks";

// Enum pour le statut de paiement des missions
const MISSION_STATUT_PAIEMENT_VALUES = [
  "en_attente",
  "partiel",
  "complet",
] as const;

/**
 * Définition des paramètres URL pour la page Missions
 */
export const missionSearchParams = {
  // Filtre par sous-traitant
  sousTraitantId: createUuidSearchParam(),

  // Filtre de statut de paiement
  statutPaiement: createEnumSearchParam(MISSION_STATUT_PAIEMENT_VALUES),

  // Plage de dates
  dateDebut: createDateStringSearchParam(),
  dateFin: createDateStringSearchParam(),

  // Recherche textuelle
  ...searchSearchParam,

  // Pagination
  ...paginationSearchParams,
};

/**
 * Type pour les paramètres de mission
 */
export type MissionSearchParams = {
  sousTraitantId: string | null;
  statutPaiement: (typeof MISSION_STATUT_PAIEMENT_VALUES)[number] | null;
  dateDebut: string | null;
  dateFin: string | null;
  search: string;
  page: number;
  pageSize: number;
};

/**
 * Convertit les search params Nuqs vers le format MissionFilters de l'API
 */
export function missionSearchParamsToFilters(
  params: Partial<MissionSearchParams>
): Record<string, string | undefined> {
  const filters: Record<string, string | undefined> = {};

  if (params.sousTraitantId) filters["sous_traitant_id"] = params.sousTraitantId;
  if (params.statutPaiement) filters["statut_paiement"] = params.statutPaiement;
  if (params.dateDebut) filters["date_debut"] = params.dateDebut;
  if (params.dateFin) filters["date_fin"] = params.dateFin;
  if (params.search) filters["search"] = params.search;

  return filters;
}
