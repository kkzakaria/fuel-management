/**
 * Hook: useReportData
 *
 * Load report data from API
 */

"use client";

import { useState, useCallback } from "react";
import type { Report, ReportFilters } from "@/lib/report-types";

interface UseReportDataReturn {
  report: Report | null;
  isLoading: boolean;
  error: string | null;
  loadReport: (filters: ReportFilters) => Promise<void>;
  clearReport: () => void;
}

export function useReportData(): UseReportDataReturn {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async (filters: ReportFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reports/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...filters,
          dateFrom: filters.dateFrom.toISOString(),
          dateTo: filters.dateTo.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de génération du rapport");
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error("Failed to load report:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearReport = useCallback(() => {
    setReport(null);
    setError(null);
  }, []);

  return {
    report,
    isLoading,
    error,
    loadReport,
    clearReport,
  };
}
