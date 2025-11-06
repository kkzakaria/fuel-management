/**
 * Hooks utilitaires réutilisables pour Nuqs
 * Fournit des patterns communs pour filtres, pagination, date ranges
 */

import { parseAsInteger, parseAsString } from "nuqs";
import type { ParserBuilder } from "nuqs";

/**
 * Hook de pagination standard
 * Fournit page et pageSize avec valeurs par défaut
 */
export const paginationSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
};

/**
 * Hook de recherche textuelle standard
 * Fournit search avec valeur par défaut vide
 */
export const searchSearchParam = {
  search: parseAsString.withDefault(""),
};

/**
 * Type helper pour extraire les types d'un objet de search params
 */
export type InferSearchParams<T extends Record<string, ParserBuilder<unknown>>> = {
  [K in keyof T]: T[K] extends ParserBuilder<infer U> ? U : never;
};
