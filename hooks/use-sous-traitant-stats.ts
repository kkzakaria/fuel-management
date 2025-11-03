/**
 * Hook pour récupérer les statistiques d'un sous-traitant
 */

"use client";

import { useState, useEffect } from "react";
import { fetchSousTraitantStatsClient } from "@/lib/supabase/sous-traitant-queries-client";
import type { SousTraitantStats } from "@/lib/supabase/sous-traitant-types";

export function useSousTraitantStats(sousTraitantId: string | null) {
  const [stats, setStats] = useState<SousTraitantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sousTraitantId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSousTraitantStatsClient(sousTraitantId);
        setStats(data);
      } catch (err) {
        setError(err as Error);
        console.error("Erreur chargement stats sous-traitant:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sousTraitantId]);

  const refresh = async () => {
    if (!sousTraitantId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSousTraitantStatsClient(sousTraitantId);
      setStats(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refresh,
  };
}
