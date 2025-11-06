/**
 * Sérialiseur pour les UUIDs dans les paramètres URL
 * Utilisé pour les IDs de relations (chauffeur_id, vehicule_id, etc.)
 */

import { createParser } from "nuqs";

// Regex UUID v4
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Parse et valide un UUID depuis l'URL
 * Retourne null si l'UUID est invalide
 */
export const parseAsUuid = createParser({
  parse: (value: string) => {
    if (!UUID_REGEX.test(value)) {
      return null;
    }
    return value;
  },
  serialize: (value: string) => value,
});

/**
 * Helper pour créer un paramètre UUID optionnel (null par défaut)
 */
export function createUuidSearchParam() {
  return parseAsUuid;
}
