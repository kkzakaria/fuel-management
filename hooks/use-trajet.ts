/**
 * Hook pour gérer les détails d'un trajet spécifique
 */

"use client";

import { useState, useEffect } from "react";
import { fetchTrajetByIdClient } from "@/lib/supabase/trajet-queries-client";

interface UseTrajetOptions {
  autoRefresh?: number; // ms between auto-refresh
}

export function useTrajet(trajetId: string, options?: UseTrajetOptions) {
  const [trajet, setTrajet] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!trajetId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchTrajetByIdClient(trajetId);
      setTrajet(data);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement trajet:", err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données initiales
  useEffect(() => {
    fetchData();
  }, [trajetId]);

  // Auto-refresh si configuré
  useEffect(() => {
    if (!options?.autoRefresh) return;

    const interval = setInterval(fetchData, options.autoRefresh);
    return () => clearInterval(interval);
  }, [options?.autoRefresh, trajetId]);

  const refresh = () => {
    fetchData();
  };

  return {
    trajet,
    loading,
    error,
    refresh,
  };
}
