/**
 * Sérialiseur pour les enums type-safe dans les paramètres URL
 * Utilisé pour les filtres de statut et types
 */

import { createParser } from "nuqs";

/**
 * Crée un parser type-safe pour un enum
 * Retourne null si la valeur ne fait pas partie de l'enum
 *
 * @example
 * const parseAsStatut = createEnumParser(["actif", "inactif", "suspendu"]);
 */
export function createEnumParser<T extends readonly string[]>(
  allowedValues: T
) {
  return createParser({
    parse: (value: string) => {
      if (allowedValues.includes(value)) {
        return value as T[number];
      }
      return null;
    },
    serialize: (value: T[number] | null) => value ?? "",
  });
}

/**
 * Helper pour créer un paramètre enum optionnel (null par défaut)
 */
export function createEnumSearchParam<T extends readonly string[]>(
  allowedValues: T
) {
  return createEnumParser(allowedValues);
}
