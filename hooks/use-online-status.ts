"use client";

import { useEffect, useState } from "react";

/**
 * Hook pour détecter le statut de connexion online/offline
 * Essentiel pour la Côte d'Ivoire avec connectivité instable
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Initialiser le statut
    setIsOnline(navigator.onLine);

    // Gestionnaire pour passage en ligne
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true); // Marquer qu'on était offline (pour déclencher sync)

      // Réinitialiser le flag après 5 secondes
      setTimeout(() => setWasOffline(false), 5000);
    };

    // Gestionnaire pour passage hors ligne
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Écouter les événements du navigateur
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Vérification périodique (au cas où les événements ne se déclenchent pas)
    const intervalId = setInterval(() => {
      const currentStatus = navigator.onLine;
      if (currentStatus !== isOnline) {
        setIsOnline(currentStatus);
        if (currentStatus) {
          setWasOffline(true);
          setTimeout(() => setWasOffline(false), 5000);
        }
      }
    }, 5000); // Vérifier toutes les 5 secondes

    // Nettoyage
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline]);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline, // Indique si on vient de se reconnecter (pour sync)
  };
}
