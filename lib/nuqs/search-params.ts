/**
 * Configuration master pour les paramètres URL Nuqs
 * Exporte tous les parsers et types pour les différentes pages
 */

// Re-export des utilitaires pour faciliter les imports
export * from "./hooks";
export * from "./serializers/date";
export * from "./serializers/uuid";
export * from "./serializers/enum";

// Re-export des parsers spécifiques par page
export * from "./parsers/trajet";
export * from "./parsers/rapport";
export * from "./parsers/vehicule";
export * from "./parsers/chauffeur";
export * from "./parsers/sous-traitant";
export * from "./parsers/mission";
