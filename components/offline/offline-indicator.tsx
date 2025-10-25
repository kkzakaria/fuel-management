"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi, CloudUpload, AlertCircle } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useSyncQueue } from "@/hooks/use-sync-queue";
import { syncManager } from "@/lib/sync/sync-manager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Indicateur de statut connexion et synchronisation
 * Affiche une bannière en haut de l'écran quand offline ou en sync
 */
export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const { pendingCount, hasPendingSync } = useSyncQueue();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Synchroniser automatiquement quand on se reconnecte
  useEffect(() => {
    if (wasOffline && isOnline && hasPendingSync && !isSyncing) {
      handleAutoSync();
    }
  }, [wasOffline, isOnline, hasPendingSync, isSyncing]);

  const handleAutoSync = async () => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      console.log("🔄 Auto-sync déclenché après reconnexion");
      const result = await syncManager.syncAll();

      if (result.success) {
        console.log("✅ Synchronisation réussie");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        console.error("❌ Échec synchronisation:", result.errors);
        setSyncError(
          `${result.failed} opération(s) échouée(s). ${result.errors.slice(0, 2).join(", ")}`
        );
      }
    } catch (error) {
      console.error("❌ Erreur sync:", error);
      setSyncError(
        error instanceof Error ? error.message : "Erreur de synchronisation"
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      const result = await syncManager.syncAll();

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        setSyncError(
          `${result.failed} opération(s) échouée(s). Réessayez plus tard.`
        );
      }
    } catch (error) {
      setSyncError(
        error instanceof Error ? error.message : "Erreur de synchronisation"
      );
    } finally {
      setIsSyncing(false);
    }
  };

  // Ne rien afficher si tout va bien
  if (isOnline && !hasPendingSync && !isSyncing && !syncError && !showSuccess) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      {/* Mode hors ligne */}
      {!isOnline && (
        <Alert variant="destructive" className="mb-2">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Vous êtes hors ligne. Les modifications seront synchronisées
              automatiquement.
            </span>
            {hasPendingSync && (
              <span className="text-sm font-medium">
                {pendingCount} opération{pendingCount > 1 ? "s" : ""} en
                attente
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Synchronisation en cours */}
      {isSyncing && (
        <Alert className="mb-2 bg-blue-50 border-blue-200">
          <CloudUpload className="h-4 w-4 text-blue-600 animate-pulse" />
          <AlertDescription className="text-blue-800">
            Synchronisation en cours...
            {pendingCount > 0 && ` (${pendingCount} opération${pendingCount > 1 ? "s" : ""})`}
          </AlertDescription>
        </Alert>
      )}

      {/* Opérations en attente */}
      {isOnline && hasPendingSync && !isSyncing && !syncError && (
        <Alert className="mb-2 bg-orange-50 border-orange-200">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-orange-800">
              {pendingCount} opération{pendingCount > 1 ? "s" : ""} en attente
              de synchronisation
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="ml-4"
            >
              <CloudUpload className="h-3 w-3 mr-1" />
              Synchroniser
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Synchronisation réussie */}
      {showSuccess && (
        <Alert className="mb-2 bg-green-50 border-green-200">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Synchronisation réussie ! Toutes les données sont à jour.
          </AlertDescription>
        </Alert>
      )}

      {/* Erreur de synchronisation */}
      {syncError && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{syncError}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="ml-4"
            >
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
