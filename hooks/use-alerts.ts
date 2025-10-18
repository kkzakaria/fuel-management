/**
 * Alerts Hook
 *
 * Hook for fetching and managing system alerts
 */

"use client";

import { useEffect, useState } from "react";
import type { Alert } from "@/lib/dashboard-types";
import { getActiveAlerts, getAlertCount } from "@/lib/supabase/alerts-queries-client";

interface UseAlertsOptions {
  limit?: number;
  enabled?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseAlertsReturn {
  alerts: Alert[];
  alertCount: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAlerts(options: UseAlertsOptions = {}): UseAlertsReturn {
  const {
    limit = 10,
    enabled = true,
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute
  } = options;

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch alerts and count in parallel
      const [alertsData, countData] = await Promise.all([
        getActiveAlerts(limit),
        getAlertCount(),
      ]);

      setAlerts(alertsData);
      setCount(countData);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch alerts"),
      );
      setAlerts([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      void fetchAlerts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, enabled]);

  // Auto-refresh
  useEffect(() => {
    if (!enabled || !autoRefresh) return;

    const interval = setInterval(() => {
      void fetchAlerts();
    }, refreshInterval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, autoRefresh, refreshInterval]);

  return {
    alerts,
    alertCount: count,
    loading,
    error,
    refetch: fetchAlerts,
  };
}
