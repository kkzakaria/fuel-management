/**
 * Hook pour gérer les statistiques d'un chauffeur
 */

"use client";

import { useState, useEffect, useCallback } from "react";

export interface ChauffeurStats {
  chauffeur_id: string;
  nom: string;
  prenom: string;
  statut: string;
  nb_trajets: number;
  km_total: number;
  nb_conteneurs: number;
  conso_moyenne: number;
  cout_carburant_total: number;
  cout_frais_total: number;
}

/**
 * Hook pour récupérer les statistiques d'un chauffeur
 * Note: Les stats sont calculées côté serveur via API route
 */
export function useChauffeurStats(
  chauffeurId: string,
  options?: {
    dateDebut?: string;
    dateFin?: string;
  }
) {
  const [stats, setStats] = useState<ChauffeurStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!chauffeurId) return;

    try {
      setLoading(true);
      setError(null);

      // Appel API route pour récupérer les stats
      const queryParams = new URLSearchParams();
      if (options?.dateDebut) queryParams.set("dateDebut", options.dateDebut);
      if (options?.dateFin) queryParams.set("dateFin", options.dateFin);

      const url = `/api/chauffeurs/${chauffeurId}/stats${queryParams.toString() ? `?${queryParams}` : ""}`;
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
      console.error("Erreur chargement stats chauffeur:", err);
    } finally {
      setLoading(false);
    }
  }, [chauffeurId, options?.dateDebut, options?.dateFin]);

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
 * Hook pour récupérer les classements des chauffeurs
 */
export function useChauffeurRankings() {
  const [rankingConteneurs, setRankingConteneurs] = useState<unknown[]>([]);
  const [rankingEconomes, setRankingEconomes] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [conteneursRes, economesRes] = await Promise.all([
        fetch("/api/chauffeurs/rankings/conteneurs"),
        fetch("/api/chauffeurs/rankings/economes"),
      ]);

      // Si les APIs n'existent pas encore (404), retourner silencieusement
      if (conteneursRes.status === 404 || economesRes.status === 404) {
        console.debug("APIs de classements non implémentées");
        return;
      }

      if (!conteneursRes.ok || !economesRes.ok) {
        throw new Error("Erreur lors de la récupération des classements");
      }

      const [conteneursData, economesData] = await Promise.all([
        conteneursRes.json(),
        economesRes.json(),
      ]);

      setRankingConteneurs(conteneursData);
      setRankingEconomes(economesData);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement classements:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => {
    fetchData();
  };

  return {
    rankingConteneurs,
    rankingEconomes,
    loading,
    error,
    refresh,
  };
}
