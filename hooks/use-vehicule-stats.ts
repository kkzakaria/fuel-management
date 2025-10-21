/**
 * Hook pour gérer les statistiques d'un véhicule
 */

"use client";

import { useState, useEffect, useCallback } from "react";

export interface VehiculeStats {
  vehicule_id: string;
  immatriculation: string;
  marque: string | null;
  modele: string | null;
  type_carburant: string | null;
  statut: string;
  kilometrage_actuel: number;
  nb_trajets: number;
  km_parcourus: number;
  conso_moyenne: number;
  cout_carburant_total: number;
  cout_total: number;
}

/**
 * Hook pour récupérer les statistiques d'un véhicule
 * Note: Les stats sont calculées côté serveur via API route
 */
export function useVehiculeStats(
  vehiculeId: string,
  options?: {
    dateDebut?: string;
    dateFin?: string;
  }
) {
  const [stats, setStats] = useState<VehiculeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!vehiculeId) return;

    try {
      setLoading(true);
      setError(null);

      // Appel API route pour récupérer les stats
      const queryParams = new URLSearchParams();
      if (options?.dateDebut) queryParams.set("dateDebut", options.dateDebut);
      if (options?.dateFin) queryParams.set("dateFin", options.dateFin);

      const url = `/api/vehicules/${vehiculeId}/stats${queryParams.toString() ? `?${queryParams}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        // Si l'API n'existe pas encore (404), retourner silencieusement
        if (response.status === 404) {
          console.debug(`API non implémentée: ${url}`);
          return;
        }
        throw new Error("Erreur lors de la récupération des statistiques");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement stats véhicule:", err);
    } finally {
      setLoading(false);
    }
  }, [vehiculeId, options?.dateDebut, options?.dateFin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => {
    fetchData();
  };

  return {
    stats,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook pour récupérer la comparaison entre véhicules
 */
export function useVehiculesComparison(
  vehiculeIds: string[],
  options?: {
    dateDebut?: string;
    dateFin?: string;
  }
) {
  const [comparison, setComparison] = useState<VehiculeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!vehiculeIds || vehiculeIds.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      // Appel API route pour récupérer la comparaison
      const queryParams = new URLSearchParams();
      vehiculeIds.forEach((id) => queryParams.append("ids", id));
      if (options?.dateDebut) queryParams.set("dateDebut", options.dateDebut);
      if (options?.dateFin) queryParams.set("dateFin", options.dateFin);

      const url = `/api/vehicules/comparison?${queryParams}`;
      const response = await fetch(url);

      if (!response.ok) {
        // Si l'API n'existe pas encore (404), retourner silencieusement
        if (response.status === 404) {
          console.debug(`API non implémentée: ${url}`);
          return;
        }
        throw new Error("Erreur lors de la récupération de la comparaison");
      }

      const data = await response.json();
      setComparison(data);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement comparaison véhicules:", err);
    } finally {
      setLoading(false);
    }
  }, [vehiculeIds, options?.dateDebut, options?.dateFin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => {
    fetchData();
  };

  return {
    comparison,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook pour récupérer les alertes maintenance d'un véhicule
 */
export function useVehiculeAlertes(vehiculeId: string) {
  const [alertes, setAlertes] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!vehiculeId) return;

    try {
      setLoading(true);
      setError(null);

      const url = `/api/vehicules/${vehiculeId}/alertes`;
      const response = await fetch(url);

      if (!response.ok) {
        // Si l'API n'existe pas encore (404), retourner silencieusement
        if (response.status === 404) {
          console.debug(`API non implémentée: ${url}`);
          return;
        }
        throw new Error("Erreur lors de la récupération des alertes");
      }

      const data = await response.json();
      setAlertes(data);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement alertes véhicule:", err);
    } finally {
      setLoading(false);
    }
  }, [vehiculeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => {
    fetchData();
  };

  return {
    alertes,
    loading,
    error,
    refresh,
  };
}
