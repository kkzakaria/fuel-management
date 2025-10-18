/**
 * Dashboard Statistics Hook
 *
 * Main hook for fetching dashboard KPIs and statistics
 */

"use client";

import { useEffect, useState } from "react";
import type {
  DashboardStats,
  PeriodPreset,
  TripChartData,
  CostChartData,
} from "@/lib/dashboard-types";
import {
  getDashboardStats,
  getTripChartData,
  getCostChartData,
} from "@/lib/supabase/dashboard-queries-client";
import { getAlertCount } from "@/lib/supabase/alerts-queries-client";
import { getPresetDateRange } from "@/lib/date-utils";

interface UseStatsOptions {
  period: PeriodPreset;
  enabled?: boolean;
}

interface UseStatsReturn {
  stats: DashboardStats | null;
  alertCount: number;
  tripChartData: TripChartData[];
  costChartData: CostChartData[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useStats(options: UseStatsOptions): UseStatsReturn {
  const { period, enabled = true } = options;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [tripChartData, setTripChartData] = useState<TripChartData[]>([]);
  const [costChartData, setCostChartData] = useState<CostChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Convert period preset to date range
      const dateRange = getPresetDateRange(period);

      // Fetch all data
      const [dashboardStats, count, tripData, costData] = await Promise.all([
        getDashboardStats(dateRange.from, dateRange.to),
        getAlertCount(),
        getTripChartData(dateRange.from, dateRange.to),
        getCostChartData(dateRange.from, dateRange.to),
      ]);

      // Update state
      setStats({
        ...dashboardStats,
        activeAlerts: count,
      });
      setAlertCount(count);
      setTripChartData(tripData);
      setCostChartData(costData);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch stats"),
      );
      setStats(null);
      setAlertCount(0);
      setTripChartData([]);
      setCostChartData([]);
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
    stats,
    alertCount,
    tripChartData,
    costChartData,
    loading,
    error,
    refetch: fetchStats,
  };
}
