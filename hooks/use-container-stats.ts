/**
 * Container Statistics Hook
 *
 * Hook for fetching container distribution statistics
 */

"use client";

import { useEffect, useState } from "react";
import type { ContainerStats, PeriodPreset } from "@/lib/dashboard-types";
import { getContainerStats } from "@/lib/supabase/dashboard-queries-client";
import { getPresetDateRange } from "@/lib/date-utils";

interface UseContainerStatsOptions {
  period: PeriodPreset;
  enabled?: boolean;
}

interface UseContainerStatsReturn {
  containerStats: ContainerStats[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useContainerStats(
  options: UseContainerStatsOptions,
): UseContainerStatsReturn {
  const { period, enabled = true } = options;
  const [stats, setStats] = useState<ContainerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const dateRange = getPresetDateRange(period);
      const data = await getContainerStats(dateRange.from, dateRange.to);
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch container stats"),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, enabled]);

  return {
    containerStats: stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
