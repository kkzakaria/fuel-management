/**
 * Database Types for Transport Manager
 *
 * NOTE: These types are manually defined based on the migration schemas.
 * After applying migrations to Supabase, run `pnpm supabase gen types typescript --local`
 * to generate types automatically from the database schema.
 *
 * For now, these types serve as a reference and will be replaced with auto-generated types.
 */

export type UserRole = "admin" | "gestionnaire" | "chauffeur" | "personnel";

export type StatutChauffeur = "actif" | "inactif" | "suspendu";
export type StatutVehicule = "actif" | "maintenance" | "inactif" | "vendu";
export type StatutSousTraitant = "actif" | "inactif" | "blackliste";
export type StatutTrajet = "en_cours" | "termine" | "annule";
export type StatutLivraison = "en_cours" | "livre" | "retour";
export type StatutMission = "en_cours" | "terminee" | "annulee";
export type TypeCarburant = "gasoil" | "essence" | "hybride" | "electrique";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  nom: string | null;
  prenom: string | null;
  telephone: string | null;
  chauffeur_id: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Localite {
  id: string;
  nom: string;
  region: string | null;
  created_at: string;
  updated_at: string;
}

export interface TypeConteneur {
  id: string;
  nom: string;
  taille_pieds: 20 | 40 | 45;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chauffeur {
  id: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  numero_permis: string | null;
  date_embauche: string | null;
  statut: StatutChauffeur;
  created_at: string;
  updated_at: string;
}

export interface Vehicule {
  id: string;
  immatriculation: string;
  marque: string | null;
  modele: string | null;
  annee: number | null;
  type_carburant: TypeCarburant;
  kilometrage_actuel: number;
  statut: StatutVehicule;
  created_at: string;
  updated_at: string;
}

export interface SousTraitant {
  id: string;
  nom_entreprise: string;
  contact_principal: string | null;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  statut: StatutSousTraitant;
  created_at: string;
  updated_at: string;
}

export interface Trajet {
  id: string;
  date_trajet: string;
  chauffeur_id: string;
  vehicule_id: string;
  localite_depart_id: string;
  localite_arrivee_id: string;
  km_debut: number;
  km_fin: number;
  parcours_total: number; // Generated column
  litrage_prevu: number | null;
  litrage_station: number | null;
  ecart_litrage: number | null; // Generated column
  prix_litre: number | null;
  consommation_au_100: number | null; // Generated column
  prix_litre_calcule: number | null; // Generated column
  frais_peage: number;
  autres_frais: number;
  statut: StatutTrajet;
  observations: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConteneurTrajet {
  id: string;
  trajet_id: string;
  type_conteneur_id: string;
  numero_conteneur: string | null;
  quantite: number;
  statut_livraison: StatutLivraison;
  created_at: string;
  updated_at: string;
}

export interface MissionSousTraitance {
  id: string;
  sous_traitant_id: string;
  date_mission: string;
  localite_depart_id: string;
  localite_arrivee_id: string;
  type_conteneur_id: string;
  numero_conteneur: string | null;
  quantite: number;
  montant_total: number;
  montant_90_pourcent: number; // Generated column
  reste_10_pourcent: number; // Generated column
  avance_payee: boolean;
  solde_paye: boolean;
  date_paiement_avance: string | null;
  date_paiement_solde: string | null;
  statut: StatutMission;
  observations: string | null;
  created_at: string;
  updated_at: string;
}

// Extended types with relations (for queries with joins)

export interface TrajetWithRelations extends Trajet {
  chauffeur?: Pick<Chauffeur, "nom" | "prenom" | "telephone">;
  vehicule?: Pick<Vehicule, "immatriculation" | "marque" | "modele" | "type_carburant">;
  localite_depart?: Pick<Localite, "nom" | "region">;
  localite_arrivee?: Pick<Localite, "nom" | "region">;
  conteneurs?: (ConteneurTrajet & {
    type_conteneur?: Pick<TypeConteneur, "nom" | "taille_pieds">;
  })[];
}

export interface MissionSousTraitanceWithRelations extends MissionSousTraitance {
  sous_traitant?: SousTraitant;
  localite_depart?: Pick<Localite, "nom" | "region">;
  localite_arrivee?: Pick<Localite, "nom" | "region">;
  type_conteneur?: Pick<TypeConteneur, "nom" | "taille_pieds" | "description">;
}

// Statistics types

export interface TrajetStatistics {
  totalTrajets: number;
  totalKm: number;
  totalLitres: number;
  totalCoutCarburant: number;
  totalPeage: number;
  avgConsommation: number;
}
