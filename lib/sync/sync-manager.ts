/**
 * Gestionnaire de synchronisation
 * Synchronise les données offline avec Supabase quand la connexion revient
 */

import { createClient } from "@/lib/supabase/client";
import {
  offlineDb,
  updateSyncMetadata,
  type SyncQueue,
} from "@/lib/db/offline-db";

export class SyncManager {
  private isSyncing = false;
  private syncInProgress = new Set<string>();

  /**
   * Synchroniser toutes les opérations en attente
   */
  async syncAll(): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
  }> {
    if (this.isSyncing) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ["Synchronisation déjà en cours"],
      };
    }

    this.isSyncing = true;
    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      // Récupérer toutes les opérations en attente
      const queueItems = await offlineDb.sync_queue.toArray();

      console.log(
        `🔄 Début synchronisation: ${queueItems.length} opérations`
      );

      // Grouper par entité pour traiter dans l'ordre
      const byEntity = this.groupByEntity(queueItems);

      // Synchroniser chaque type d'entité
      for (const [entity, items] of Object.entries(byEntity)) {
        await updateSyncMetadata(entity, "syncing");

        try {
          const result = await this.syncEntity(entity, items);
          synced += result.synced;
          failed += result.failed;
          errors.push(...result.errors);

          if (result.failed === 0) {
            await updateSyncMetadata(entity, "idle");
          } else {
            await updateSyncMetadata(
              entity,
              "error",
              `${result.failed} opérations échouées`
            );
          }
        } catch (error) {
          failed += items.length;
          errors.push(
            `Erreur sync ${entity}: ${error instanceof Error ? error.message : "Erreur inconnue"}`
          );
          await updateSyncMetadata(
            entity,
            "error",
            error instanceof Error ? error.message : "Erreur inconnue"
          );
        }
      }

      console.log(
        `✅ Synchronisation terminée: ${synced} réussies, ${failed} échouées`
      );

      return {
        success: failed === 0,
        synced,
        failed,
        errors,
      };
    } catch (error) {
      console.error("❌ Erreur synchronisation:", error);
      return {
        success: false,
        synced,
        failed,
        errors: [
          ...errors,
          error instanceof Error ? error.message : "Erreur inconnue",
        ],
      };
    } finally {
      this.isSyncing = false;
      this.syncInProgress.clear();
    }
  }

  /**
   * Synchroniser une entité spécifique
   */
  private async syncEntity(
    _entity: string,
    items: SyncQueue[]
  ): Promise<{ synced: number; failed: number; errors: string[] }> {
    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const item of items) {
      // Éviter les doublons en cours
      if (this.syncInProgress.has(item.entity_id)) {
        continue;
      }

      this.syncInProgress.add(item.entity_id);

      try {
        const result = await this.syncItem(item);
        if (result.success) {
          synced++;
          // Supprimer de la queue
          if (item.id) {
            await offlineDb.sync_queue.delete(item.id);
          }
        } else {
          failed++;
          errors.push(result.error || "Erreur inconnue");
          // Incrémenter retry_count
          if (item.id) {
            await offlineDb.sync_queue.update(item.id, {
              retry_count: item.retry_count + 1,
              last_error: result.error,
            });
          }
        }
      } catch (error) {
        failed++;
        const errorMsg =
          error instanceof Error ? error.message : "Erreur inconnue";
        errors.push(`${item.entity} ${item.entity_id}: ${errorMsg}`);

        // Incrémenter retry_count
        if (item.id) {
          await offlineDb.sync_queue.update(item.id, {
            retry_count: item.retry_count + 1,
            last_error: errorMsg,
          });
        }
      } finally {
        this.syncInProgress.delete(item.entity_id);
      }
    }

    return { synced, failed, errors };
  }

  /**
   * Synchroniser un item individuel
   */
  private async syncItem(
    item: SyncQueue
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    try {
      switch (item.entity) {
        case "trajet": {
          if (item.operation === "create") {
            const { error } = await supabase
              .from("TRAJET")
              .insert(item.data);
            if (error) throw error;
          } else if (item.operation === "update") {
            const { error } = await supabase
              .from("TRAJET")
              .update(item.data)
              .eq("id", item.entity_id);
            if (error) throw error;
          } else if (item.operation === "delete") {
            const { error } = await supabase
              .from("TRAJET")
              .delete()
              .eq("id", item.entity_id);
            if (error) throw error;
          }
          break;
        }

        case "conteneur": {
          if (item.operation === "create") {
            const { error } = await supabase
              .from("CONTENEUR_TRAJET")
              .insert(item.data);
            if (error) throw error;
          } else if (item.operation === "update") {
            const { error } = await supabase
              .from("CONTENEUR_TRAJET")
              .update(item.data)
              .eq("id", item.entity_id);
            if (error) throw error;
          } else if (item.operation === "delete") {
            const { error } = await supabase
              .from("CONTENEUR_TRAJET")
              .delete()
              .eq("id", item.entity_id);
            if (error) throw error;
          }
          break;
        }

        case "chauffeur": {
          if (item.operation === "create") {
            const { error } = await supabase
              .from("CHAUFFEUR")
              .insert(item.data);
            if (error) throw error;
          } else if (item.operation === "update") {
            const { error } = await supabase
              .from("CHAUFFEUR")
              .update(item.data)
              .eq("id", item.entity_id);
            if (error) throw error;
          } else if (item.operation === "delete") {
            const { error } = await supabase
              .from("CHAUFFEUR")
              .delete()
              .eq("id", item.entity_id);
            if (error) throw error;
          }
          break;
        }

        case "vehicule": {
          if (item.operation === "create") {
            const { error } = await supabase
              .from("VEHICULE")
              .insert(item.data);
            if (error) throw error;
          } else if (item.operation === "update") {
            const { error } = await supabase
              .from("VEHICULE")
              .update(item.data)
              .eq("id", item.entity_id);
            if (error) throw error;
          } else if (item.operation === "delete") {
            const { error } = await supabase
              .from("VEHICULE")
              .delete()
              .eq("id", item.entity_id);
            if (error) throw error;
          }
          break;
        }

        default:
          throw new Error(`Type d'entité non supporté: ${item.entity}`);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  }

  /**
   * Grouper les items par entité
   */
  private groupByEntity(
    items: SyncQueue[]
  ): Record<string, SyncQueue[]> {
    return items.reduce(
      (acc, item) => {
        if (!acc[item.entity]) {
          acc[item.entity] = [];
        }
        acc[item.entity]!.push(item);
        return acc;
      },
      {} as Record<string, SyncQueue[]>
    );
  }

  /**
   * Vérifier si une synchronisation est en cours
   */
  get isCurrentlySyncing(): boolean {
    return this.isSyncing;
  }

  /**
   * Obtenir le nombre d'opérations en cours
   */
  get syncingCount(): number {
    return this.syncInProgress.size;
  }
}

// Instance singleton
export const syncManager = new SyncManager();
