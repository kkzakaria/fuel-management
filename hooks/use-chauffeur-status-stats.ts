/**
 * Chauffeur Status Statistics Hook
 *
 * Hook for fetching chauffeur distribution by status
 */

"use client";

import { useEffect, useState } from "react";
import type { ChauffeurStatusStats } from "@/lib/dashboard-types";
import { getChauffeurStatusStats } from "@/lib/supabase/dashboard-queries-client";

interface UseChauffeurStatusStatsOptions {
  enabled?: boolean;
}

interface UseChauffeurStatusStatsReturn {
  chauffeurStats: ChauffeurStatusStats[];
  totalChauffeurs: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useChauffeurStatusStats(
  options: UseChauffeurStatusStatsOptions = {},
): UseChauffeurStatusStatsReturn {
  const { enabled = true } = options;
  const [stats, setStats] = useState<ChauffeurStatusStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getChauffeurStatusStats();
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch chauffeur status stats"),
      );
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      void fetchStats();
    }
  }, [enabled]);

  const totalChauffeurs = stats.reduce((sum, stat) => sum + stat.count, 0);

  return {
    chauffeurStats: stats,
    totalChauffeurs,
    loading,
    error,
    refetch: fetchStats,
  };
}
