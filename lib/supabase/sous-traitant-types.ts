/**
 * Types TypeScript pour les sous-traitants et missions
 */

export interface SousTraitant {
  id: string;
  nom_entreprise: string;
  contact_principal: string | null;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  statut: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MissionSousTraitance {
  id: string;
  sous_traitant_id: string;
  date_mission: string;
  localite_depart_id: string;
  localite_arrivee_id: string;
  type_conteneur_id: string;
  numero_conteneur?: string | null;
  quantite: number;
  montant_total: number;
  montant_90_pourcent: number;
  reste_10_pourcent: number;
  avance_payee: boolean;
  solde_paye: boolean;
  date_paiement_avance?: string | null;
  date_paiement_solde?: string | null;
  statut: "en_cours" | "terminee" | "annulee";
  observations?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SousTraitantWithMissions extends SousTraitant {
  missions: Array<MissionSousTraitance & {
    localite_depart?: { id: string; nom: string } | null;
    localite_arrivee?: { id: string; nom: string } | null;
    type_conteneur?: {
      id: string;
      nom: string;
      taille_pieds: number;
    } | null;
  }>;
}

export interface MissionSousTraitanceWithDetails extends MissionSousTraitance {
  sous_traitant?: SousTraitant | null;
  localite_depart?: {
    id: string;
    nom: string;
    region?: string | null;
  } | null;
  localite_arrivee?: {
    id: string;
    nom: string;
    region?: string | null;
  } | null;
  type_conteneur?: {
    id: string;
    nom: string;
    taille_pieds: number;
  } | null;
}

export interface SousTraitantStats {
  total_missions: number;
  missions_en_cours: number;
  missions_terminees: number;
  montant_total_missions: number;
  montant_paye: number;
  montant_restant: number;
}
