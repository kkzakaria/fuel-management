/**
 * Sérialiseur pour les dates ISO dans les paramètres URL
 * Utilisé pour les filtres de date (date_debut, date_fin, dateFrom, dateTo)
 */

import { createParser } from "nuqs";

/**
 * Parse une date ISO depuis l'URL et retourne un objet Date
 * Format attendu: YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss.sssZ
 */
export const parseAsIsoDate = createParser({
  parse: (value: string) => {
    const date = new Date(value);
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  },
  serialize: (value: Date) => value.toISOString(),
});

/**
 * Parse une date ISO depuis l'URL et retourne une chaîne ISO
 * Utilisé quand on veut garder le format string au lieu de Date object
 */
export const parseAsIsoString = createParser({
  parse: (value: string) => {
    const date = new Date(value);
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return null;
    }
    return value; // Retourner la string originale si valide
  },
  serialize: (value: string) => value,
});

/**
 * Helper pour créer un paramètre de date optionnel (null par défaut)
 */
export function createDateSearchParam() {
  return parseAsIsoDate;
}

/**
 * Helper pour créer un paramètre de date string optionnel (null par défaut)
 */
export function createDateStringSearchParam() {
  return parseAsIsoString;
}
