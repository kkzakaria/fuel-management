/**
 * Offline Database avec Dexie.js
 * Base de données locale IndexedDB pour mode hors ligne
 */

import Dexie, { type EntityTable } from "dexie";

// Types pour les données offline
export interface OfflineTrajet {
  id: string;
  date_trajet: string;
  chauffeur_id: string;
  vehicule_id: string;
  localite_depart_id: string;
  localite_destination_id: string;
  km_depart: number;
  km_retour: number;
  litrage_prevu: number;
  litrage_station: number;
  prix_litre: number;
  frais_peage?: number;
  autres_frais?: number;
  statut: "en_cours" | "termine" | "annule";
  commentaires?: string;
  created_at: string;
  synced: boolean; // Indique si synchronisé avec Supabase
  operation: "create" | "update" | "delete"; // Type d'opération à synchroniser
}

export interface OfflineConteneur {
  id: string;
  trajet_id: string;
  type_conteneur_id: string;
  numero_conteneur?: string;
  statut_livraison: "en_transit" | "livre" | "retourne";
  created_at: string;
  synced: boolean;
  operation: "create" | "update" | "delete";
}

export interface OfflineChauffeur {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  numero_permis: string;
  date_embauche: string;
  statut: "actif" | "inactif" | "suspendu";
  created_at: string;
  synced: boolean;
  last_sync?: string;
}

export interface OfflineVehicule {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  annee_fabrication: number;
  type_carburant: "gasoil" | "essence" | "hybride" | "electrique";
  kilometrage_actuel: number;
  consommation_moyenne?: number;
  statut: "actif" | "maintenance" | "inactif" | "vendu";
  created_at: string;
  synced: boolean;
  last_sync?: string;
}

export interface OfflineLocalite {
  id: string;
  nom: string;
  type: "ville" | "port" | "frontiere";
  district?: string;
  synced: boolean;
  last_sync?: string;
}

export interface OfflineTypeConteneur {
  id: string;
  nom: string;
  longueur: number;
  largeur: number;
  hauteur: number;
  poids_max: number;
  synced: boolean;
  last_sync?: string;
}

// Queue pour les opérations à synchroniser
export interface SyncQueue {
  id?: number;
  entity: "trajet" | "conteneur" | "chauffeur" | "vehicule";
  entity_id: string;
  operation: "create" | "update" | "delete";
  data: unknown;
  created_at: string;
  retry_count: number;
  last_error?: string;
}

// Métadonnées de synchronisation
export interface SyncMetadata {
  id?: number;
  entity: string;
  last_sync: string;
  sync_version: number;
  status: "idle" | "syncing" | "error";
  error_message?: string;
}

// Classe de base de données Dexie
export class OfflineDatabase extends Dexie {
  // Tables
  trajets!: EntityTable<OfflineTrajet, "id">;
  conteneurs!: EntityTable<OfflineConteneur, "id">;
  chauffeurs!: EntityTable<OfflineChauffeur, "id">;
  vehicules!: EntityTable<OfflineVehicule, "id">;
  localites!: EntityTable<OfflineLocalite, "id">;
  types_conteneur!: EntityTable<OfflineTypeConteneur, "id">;
  sync_queue!: EntityTable<SyncQueue, "id">;
  sync_metadata!: EntityTable<SyncMetadata, "id">;

  constructor() {
    super("TransportManagerDB");

    // Définition du schéma (version 2)
    // Version 2: Ajout de retry_count et last_error dans sync_queue
    this.version(2).stores({
      // Trajets: recherche par id, date, chauffeur, véhicule, statut
      trajets:
        "id, date_trajet, chauffeur_id, vehicule_id, statut, synced, created_at",

      // Conteneurs: recherche par id, trajet, type
      conteneurs: "id, trajet_id, type_conteneur_id, synced",

      // Chauffeurs: recherche par id, nom, statut
      chauffeurs: "id, nom, prenom, numero_permis, statut, synced",

      // Véhicules: recherche par id, immatriculation, statut
      vehicules: "id, immatriculation, statut, synced",

      // Localités: recherche par id, nom, type
      localites: "id, nom, type, synced",

      // Types de conteneurs: recherche par id, nom
      types_conteneur: "id, nom, synced",

      // Queue de synchronisation: auto-increment id, recherche par entity
      // retry_count et last_error sont des champs non-indexés
      sync_queue: "++id, entity, entity_id, operation, created_at, retry_count",

      // Métadonnées de sync: auto-increment id, recherche par entity
      sync_metadata: "++id, entity, last_sync, status",
    });
  }
}

// Instance singleton de la base de données
export const offlineDb = new OfflineDatabase();

// Fonction helper pour ajouter une opération à la queue de sync
export async function addToSyncQueue(
  entity: SyncQueue["entity"],
  entity_id: string,
  operation: SyncQueue["operation"],
  data: unknown
): Promise<void> {
  await offlineDb.sync_queue.add({
    entity,
    entity_id,
    operation,
    data,
    created_at: new Date().toISOString(),
    retry_count: 0,
  });
}

// Fonction helper pour mettre à jour les métadonnées de sync
export async function updateSyncMetadata(
  entity: string,
  status: SyncMetadata["status"],
  error_message?: string
): Promise<void> {
  const existing = await offlineDb.sync_metadata
    .where("entity")
    .equals(entity)
    .first();

  if (existing) {
    await offlineDb.sync_metadata.update(existing.id!, {
      last_sync: new Date().toISOString(),
      sync_version: (existing.sync_version || 0) + 1,
      status,
      error_message,
    });
  } else {
    await offlineDb.sync_metadata.add({
      entity,
      last_sync: new Date().toISOString(),
      sync_version: 1,
      status,
      error_message,
    });
  }
}

// Fonction pour vider la queue après synchronisation réussie
export async function clearSyncQueue(entity?: SyncQueue["entity"]): Promise<void> {
  if (entity) {
    await offlineDb.sync_queue.where("entity").equals(entity).delete();
  } else {
    await offlineDb.sync_queue.clear();
  }
}

// Fonction pour obtenir les statistiques de la queue
export async function getSyncQueueStats() {
  const total = await offlineDb.sync_queue.count();
  const byEntity = await offlineDb.sync_queue.toArray();

  const stats = {
    total,
    trajets: byEntity.filter((item) => item.entity === "trajet").length,
    conteneurs: byEntity.filter((item) => item.entity === "conteneur").length,
    chauffeurs: byEntity.filter((item) => item.entity === "chauffeur").length,
    vehicules: byEntity.filter((item) => item.entity === "vehicule").length,
    failed: byEntity.filter((item) => item.retry_count > 3).length,
  };

  return stats;
}

export default offlineDb;
