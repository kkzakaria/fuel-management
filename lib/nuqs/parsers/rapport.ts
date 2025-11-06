/**
 * Parsers Nuqs pour la page Rapports
 * Gère 6 paramètres: reportType (requis), dateFrom, dateTo, chauffeurId, vehiculeId, destinationId
 */

import { createUuidSearchParam } from "../serializers/uuid";
import { createDateStringSearchParam } from "../serializers/date";
import { createEnumSearchParam } from "../serializers/enum";

// Enum pour les types de rapport
const REPORT_TYPE_VALUES = [
  "monthly",
  "driver",
  "vehicle",
  "destination",
  "financial",
] as const;

/**
 * Définition des paramètres URL pour la page Rapports
 */
export const rapportSearchParams = {
  // Type de rapport (requis)
  reportType: createEnumSearchParam(REPORT_TYPE_VALUES),

  // Plage de dates
  dateFrom: createDateStringSearchParam(),
  dateTo: createDateStringSearchParam(),

  // Filtres conditionnels selon le type de rapport
  chauffeurId: createUuidSearchParam(),
  vehiculeId: createUuidSearchParam(),
  destinationId: createUuidSearchParam(),
};

/**
 * Type pour les paramètres de rapport
 */
export type RapportSearchParams = {
  reportType: (typeof REPORT_TYPE_VALUES)[number] | null;
  dateFrom: string | null;
  dateTo: string | null;
  chauffeurId: string | null;
  vehiculeId: string | null;
  destinationId: string | null;
};
