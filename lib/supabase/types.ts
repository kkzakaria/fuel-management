/**
 * Database Types Helpers
 *
 * Ce fichier réexporte les types générés automatiquement depuis database.types.ts
 * avec des noms plus simples pour faciliter l'utilisation.
 *
 * Les types sont générés via: pnpm supabase gen types typescript --linked
 */

import type { Database } from "./database.types";

// Tables Row types (lecture)
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Chauffeur = Database["public"]["Tables"]["chauffeur"]["Row"];
export type Vehicule = Database["public"]["Tables"]["vehicule"]["Row"];
export type Trajet = Database["public"]["Tables"]["trajet"]["Row"];
export type Localite = Database["public"]["Tables"]["localite"]["Row"];
export type TypeConteneur = Database["public"]["Tables"]["type_conteneur"]["Row"];
export type ConteneurTrajet = Database["public"]["Tables"]["conteneur_trajet"]["Row"];
export type SousTraitant = Database["public"]["Tables"]["sous_traitant"]["Row"];
export type MissionSousTraitance = Database["public"]["Tables"]["mission_sous_traitance"]["Row"];
export type FraisTrajet = Database["public"]["Tables"]["frais_trajet"]["Row"];

// Enums (from database)
export type UserRole = Database["public"]["Enums"]["user_role"];

// Enums (inferred from database constraints - not PostgreSQL ENUMs)
// Ces types sont basés sur les contraintes CHECK dans la base de données
export type StatutChauffeur = "actif" | "inactif" | "suspendu";
export type StatutVehicule = "actif" | "maintenance" | "inactif" | "vendu";
export type StatutSousTraitant = "actif" | "inactif" | "blackliste";
export type StatutTrajet = "en_cours" | "termine" | "annule";
export type StatutLivraison = "en_cours" | "livre" | "retour";
export type StatutMission = "en_cours" | "terminee" | "annulee";
export type TypeCarburant = "gasoil" | "essence" | "hybride" | "electrique";

// Insert types (pour les créations)
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ChauffeurInsert = Database["public"]["Tables"]["chauffeur"]["Insert"];
export type VehiculeInsert = Database["public"]["Tables"]["vehicule"]["Insert"];
export type TrajetInsert = Database["public"]["Tables"]["trajet"]["Insert"];
export type LocaliteInsert = Database["public"]["Tables"]["localite"]["Insert"];
export type TypeConteneurInsert = Database["public"]["Tables"]["type_conteneur"]["Insert"];
export type ConteneurTrajetInsert = Database["public"]["Tables"]["conteneur_trajet"]["Insert"];
export type SousTraitantInsert = Database["public"]["Tables"]["sous_traitant"]["Insert"];
export type MissionSousTraitanceInsert = Database["public"]["Tables"]["mission_sous_traitance"]["Insert"];
export type FraisTrajetInsert = Database["public"]["Tables"]["frais_trajet"]["Insert"];

// Update types (pour les modifications)
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type ChauffeurUpdate = Database["public"]["Tables"]["chauffeur"]["Update"];
export type VehiculeUpdate = Database["public"]["Tables"]["vehicule"]["Update"];
export type TrajetUpdate = Database["public"]["Tables"]["trajet"]["Update"];
export type LocaliteUpdate = Database["public"]["Tables"]["localite"]["Update"];
export type TypeConteneurUpdate = Database["public"]["Tables"]["type_conteneur"]["Update"];
export type ConteneurTrajetUpdate = Database["public"]["Tables"]["conteneur_trajet"]["Update"];
export type SousTraitantUpdate = Database["public"]["Tables"]["sous_traitant"]["Update"];
export type MissionSousTraitanceUpdate = Database["public"]["Tables"]["mission_sous_traitance"]["Update"];
export type FraisTrajetUpdate = Database["public"]["Tables"]["frais_trajet"]["Update"];

// Export du type Database complet pour usage avancé
export type { Database };
