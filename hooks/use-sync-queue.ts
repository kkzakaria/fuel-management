"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { offlineDb, getSyncQueueStats } from "@/lib/db/offline-db";
import type { SyncQueue } from "@/lib/db/offline-db";

/**
 * Hook pour gérer la queue de synchronisation
 * Affiche les opérations en attente de sync
 */
export function useSyncQueue() {
  const [stats, setStats] = useState({
    total: 0,
    trajets: 0,
    conteneurs: 0,
    chauffeurs: 0,
    vehicules: 0,
    failed: 0,
  });

  // Utiliser liveQuery de Dexie pour réactivité temps réel
  const queueItems = useLiveQuery(() => offlineDb.sync_queue.toArray(), []);

  const pendingCount = useLiveQuery(
    () => offlineDb.sync_queue.count(),
    []
  );

  // Mettre à jour les stats quand la queue change
  useEffect(() => {
    getSyncQueueStats().then(setStats);
  }, [queueItems]);

  // Obtenir les items en échec (retry_count > 3)
  const failedItems = useLiveQuery(
    () => offlineDb.sync_queue.where("retry_count").above(3).toArray(),
    []
  );

  // Obtenir les metadata de sync
  const syncMetadata = useLiveQuery(
    () => offlineDb.sync_metadata.toArray(),
    []
  );

  return {
    queueItems: queueItems || [],
    pendingCount: pendingCount || 0,
    failedItems: failedItems || [],
    stats,
    syncMetadata: syncMetadata || [],
    hasPendingSync: (pendingCount || 0) > 0,
  };
}

/**
 * Hook pour ajouter des items à la queue de sync
 */
export function useAddToQueue() {
  const addToQueue = async (
    entity: SyncQueue["entity"],
    entityId: string,
    operation: SyncQueue["operation"],
    data: unknown
  ) => {
    try {
      await offlineDb.sync_queue.add({
        entity,
        entity_id: entityId,
        operation,
        data,
        created_at: new Date().toISOString(),
        retry_count: 0,
      });
      return { success: true };
    } catch (error) {
      console.error("Erreur ajout queue:", error);
      return { success: false, error };
    }
  };

  return { addToQueue };
}
