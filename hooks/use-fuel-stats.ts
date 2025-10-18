/**
 * Fuel Statistics Hook
 *
 * Hook for fetching fuel consumption and cost statistics
 */

"use client";

import { useEffect, useState } from "react";
import type { VehicleConsumption, PeriodPreset } from "@/lib/dashboard-types";
import { getVehicleConsumptionStats } from "@/lib/supabase/dashboard-queries-client";
import { getPresetDateRange } from "@/lib/date-utils";

interface UseFuelStatsOptions {
  period: PeriodPreset;
  limit?: number;
  enabled?: boolean;
}

interface UseFuelStatsReturn {
  vehicleStats: VehicleConsumption[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFuelStats(
  options: UseFuelStatsOptions,
): UseFuelStatsReturn {
  const { period, limit = 10, enabled = true } = options;
  const [vehicles, setVehicles] = useState<VehicleConsumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const dateRange = getPresetDateRange(period);
      const data = await getVehicleConsumptionStats(
        dateRange.from,
        dateRange.to,
        limit,
      );
      setVehicles(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch fuel stats"),
      );
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      void fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, limit, enabled]);

  return {
    vehicleStats: vehicles,
    loading,
    error,
    refetch: fetchStats,
  };
}
