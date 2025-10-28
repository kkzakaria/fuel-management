/**
 * Supabase Database Queries
 *
 * Centralized location for all database queries with CRUD operations for:
 * - LOCALITE (Locations)
 * - TYPE_CONTENEUR (Container Types)
 * - CHAUFFEUR (Drivers)
 * - VEHICULE (Vehicles)
 * - TRAJET (Trips)
 * - CONTENEUR_TRAJET (Trip Containers)
 * - SOUS_TRAITANT (Subcontractors)
 * - MISSION_SOUS_TRAITANCE (Subcontractor Missions)
 */

import { createClient } from "./server";

// =============================================================================
// LOCALITE (Locations) Queries
// =============================================================================

export async function getLocalites() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("localite")
    .select("*")
    .order("nom");

  if (error) throw error;
  return data;
}

export async function getLocalitesByRegion(region: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("localite")
    .select("*")
    .eq("region", region)
    .order("nom");

  if (error) throw error;
  return data;
}

export async function getLocaliteById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("localite")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// TYPE_CONTENEUR (Container Types) Queries
// =============================================================================

export async function getTypeConteneurs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("type_conteneur")
    .select("*")
    .order("taille_pieds");

  if (error) throw error;
  return data;
}

export async function getTypeConteneurById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("type_conteneur")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// CHAUFFEUR (Drivers) Queries
// =============================================================================

export async function getChauffeurs(statutFilter?: string) {
  const supabase = await createClient();
  let query = supabase.from("chauffeur").select("*");

  if (statutFilter) {
    query = query.eq("statut", statutFilter);
  }

  const { data, error } = await query.order("nom");

  if (error) throw error;
  return data;
}

export async function getChauffeurById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chauffeur")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createChauffeur(chauffeur: {
  nom: string;
  prenom: string;
  telephone?: string;
  numero_permis?: string;
  date_embauche?: string;
  statut?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chauffeur")
    .insert(chauffeur)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateChauffeur(
  id: string,
  updates: Partial<{
    nom: string;
    prenom: string;
    telephone: string;
    numero_permis: string;
    date_embauche: string;
    statut: string;
  }>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chauffeur")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// VEHICULE (Vehicles) Queries
// =============================================================================

export async function getVehicules(statutFilter?: string) {
  const supabase = await createClient();
  let query = supabase.from("vehicule").select("*");

  if (statutFilter) {
    query = query.eq("statut", statutFilter);
  }

  const { data, error } = await query.order("immatriculation");

  if (error) throw error;
  return data;
}

export async function getVehiculeById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicule")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createVehicule(vehicule: {
  immatriculation: string;
  marque?: string;
  modele?: string;
  annee?: number;
  type_carburant?: string;
  kilometrage_actuel?: number;
  statut?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicule")
    .insert(vehicule)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVehicule(
  id: string,
  updates: Partial<{
    immatriculation: string;
    marque: string;
    modele: string;
    annee: number;
    type_carburant: string;
    kilometrage_actuel: number;
    statut: string;
  }>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicule")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// SOUS_TRAITANT (Subcontractors) Queries
// =============================================================================

export async function getSousTraitants(statutFilter?: string) {
  const supabase = await createClient();
  let query = supabase.from("sous_traitant").select("*");

  if (statutFilter) {
    query = query.eq("statut", statutFilter);
  }

  const { data, error } = await query.order("nom_entreprise");

  if (error) throw error;
  return data;
}

export async function getSousTraitantById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sous_traitant")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createSousTraitant(sousTraitant: {
  nom_entreprise: string;
  contact_principal?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  statut?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sous_traitant")
    .insert(sousTraitant)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSousTraitant(
  id: string,
  updates: Partial<{
    nom_entreprise: string;
    contact_principal: string;
    telephone: string;
    email: string;
    adresse: string;
    statut: string;
  }>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sous_traitant")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// TRAJET (Trips) Queries
// =============================================================================

export async function getTrajets(options?: {
  chauffeurId?: string;
  vehiculeId?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  limit?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("trajet")
    .select(
      `
      *,
      chauffeur:chauffeur(nom, prenom),
      vehicule:vehicule(immatriculation, marque, modele),
      localite_depart:localite_depart_id(nom, region),
      localite_arrivee:localite_arrivee_id(nom, region)
    `
    );

  if (options?.chauffeurId) {
    query = query.eq("chauffeur_id", options.chauffeurId);
  }
  if (options?.vehiculeId) {
    query = query.eq("vehicule_id", options.vehiculeId);
  }
  if (options?.dateDebut) {
    query = query.gte("date_trajet", options.dateDebut);
  }
  if (options?.dateFin) {
    query = query.lte("date_trajet", options.dateFin);
  }
  if (options?.statut) {
    query = query.eq("statut", options.statut);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query.order("date_trajet", {
    ascending: false,
  });

  if (error) throw error;
  return data;
}

export async function getTrajetById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trajet")
    .select(
      `
      *,
      chauffeur:chauffeur(nom, prenom, telephone),
      vehicule:vehicule(immatriculation, marque, modele, type_carburant),
      localite_depart:localite_depart_id(nom, region),
      localite_arrivee:localite_arrivee_id(nom, region),
      conteneurs:conteneur_trajet(
        *,
        type_conteneur:type_conteneur(nom, taille_pieds)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createTrajet(trajet: {
  date_trajet?: string;
  chauffeur_id: string;
  vehicule_id: string;
  localite_depart_id: string;
  localite_arrivee_id: string;
  km_debut: number;
  km_fin: number;
  litrage_prevu?: number;
  litrage_station?: number;
  prix_litre?: number;
  frais_peage?: number;
  autres_frais?: number;
  statut?: string;
  observations?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trajet")
    .insert(trajet)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTrajet(
  id: string,
  updates: Partial<{
    date_trajet: string;
    km_debut: number;
    km_fin: number;
    litrage_prevu: number;
    litrage_station: number;
    prix_litre: number;
    frais_peage: number;
    autres_frais: number;
    statut: string;
    observations: string;
  }>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trajet")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// CONTENEUR_TRAJET (Trip Containers) Queries
// =============================================================================

export async function getConteneursByTrajet(trajetId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conteneur_trajet")
    .select(
      `
      *,
      type_conteneur:type_conteneur(nom, taille_pieds, description)
    `
    )
    .eq("trajet_id", trajetId);

  if (error) throw error;
  return data;
}

export async function createConteneurTrajet(conteneur: {
  trajet_id: string;
  type_conteneur_id: string;
  numero_conteneur?: string;
  quantite?: number;
  statut_livraison?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conteneur_trajet")
    .insert(conteneur)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// MISSION_SOUS_TRAITANCE (Subcontractor Missions) Queries
// =============================================================================

export async function getMissionsSousTraitance(options?: {
  sousTraitantId?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  paiementPending?: boolean;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("mission_sous_traitance")
    .select(
      `
      *,
      sous_traitant:sous_traitant(nom_entreprise, contact_principal, telephone),
      localite_depart:localite_depart_id(nom, region),
      localite_arrivee:localite_arrivee_id(nom, region),
      type_conteneur:type_conteneur(nom, taille_pieds)
    `
    );

  if (options?.sousTraitantId) {
    query = query.eq("sous_traitant_id", options.sousTraitantId);
  }
  if (options?.dateDebut) {
    query = query.gte("date_mission", options.dateDebut);
  }
  if (options?.dateFin) {
    query = query.lte("date_mission", options.dateFin);
  }
  if (options?.statut) {
    query = query.eq("statut", options.statut);
  }
  if (options?.paiementPending) {
    query = query.or("avance_payee.eq.false,solde_paye.eq.false");
  }

  const { data, error } = await query.order("date_mission", {
    ascending: false,
  });

  if (error) throw error;
  return data;
}

export async function getMissionSousTraitanceById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mission_sous_traitance")
    .select(
      `
      *,
      sous_traitant:sous_traitant(*),
      localite_depart:localite_depart_id(nom, region),
      localite_arrivee:localite_arrivee_id(nom, region),
      type_conteneur:type_conteneur(nom, taille_pieds, description)
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createMissionSousTraitance(mission: {
  sous_traitant_id: string;
  date_mission?: string;
  localite_depart_id: string;
  localite_arrivee_id: string;
  type_conteneur_id: string;
  numero_conteneur?: string;
  quantite?: number;
  montant_total: number;
  statut?: string;
  observations?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mission_sous_traitance")
    .insert(mission)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMissionSousTraitance(
  id: string,
  updates: Partial<{
    date_mission: string;
    montant_total: number;
    avance_payee: boolean;
    solde_paye: boolean;
    date_paiement_avance: string;
    date_paiement_solde: string;
    statut: string;
    observations: string;
  }>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mission_sous_traitance")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// STATISTICS Queries
// =============================================================================

export async function getTrajetStats(options?: {
  chauffeurId?: string;
  vehiculeId?: string;
  dateDebut?: string;
  dateFin?: string;
}) {
  const supabase = await createClient();
  let query = supabase.from("trajet").select("*");

  if (options?.chauffeurId) {
    query = query.eq("chauffeur_id", options.chauffeurId);
  }
  if (options?.vehiculeId) {
    query = query.eq("vehicule_id", options.vehiculeId);
  }
  if (options?.dateDebut) {
    query = query.gte("date_trajet", options.dateDebut);
  }
  if (options?.dateFin) {
    query = query.lte("date_trajet", options.dateFin);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Calculate statistics
  const totalTrajets = data.length;
  const totalKm = data.reduce((sum, t) => sum + (t.parcours_total || 0), 0);
  const totalLitres = data.reduce((sum, t) => sum + (t.litrage_station || 0), 0);
  const totalCoutCarburant = data.reduce(
    (sum, t) => sum + (t.prix_litre || 0),
    0
  );
  const totalPeage = data.reduce((sum, t) => sum + (t.frais_peage || 0), 0);
  const avgConsommation =
    totalTrajets > 0
      ? data.reduce((sum, t) => sum + (t.consommation_au_100 || 0), 0) /
        totalTrajets
      : 0;

  return {
    totalTrajets,
    totalKm,
    totalLitres,
    totalCoutCarburant,
    totalPeage,
    avgConsommation,
  };
}
