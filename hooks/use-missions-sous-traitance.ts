/**
 * Hook pour gérer la liste des missions de sous-traitance avec filtres et pagination
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { MissionSousTraitanceWithDetails } from "@/lib/supabase/sous-traitant-types";
import { fetchMissionsSousTraitanceClient } from "@/lib/supabase/sous-traitant-queries-client";
import type { MissionSousTraitanceFilters } from "@/lib/validations/sous-traitant";

interface UseMissionsSousTraitanceOptions {
  initialFilters?: MissionSousTraitanceFilters;
  pageSize?: number;
  autoRefresh?: number;
}

export function useMissionsSousTraitance(options?: UseMissionsSousTraitanceOptions) {
  const [missions, setMissions] = useState<MissionSousTraitanceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<MissionSousTraitanceFilters>(
    options?.initialFilters || {}
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const pageSize = options?.pageSize || 20;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchMissionsSousTraitanceClient({
        filters,
        page,
        pageSize,
      });
      setMissions(result.missions);
      setCount(result.count);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement missions:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!options?.autoRefresh) return;
    const interval = setInterval(fetchData, options.autoRefresh);
    return () => clearInterval(interval);
  }, [options?.autoRefresh, fetchData]);

  const updateFilters = (newFilters: Partial<MissionSousTraitanceFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const nextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const previousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  const refresh = () => {
    fetchData();
  };

  return {
    missions,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    page,
    totalPages,
    count,
    pageSize,
    nextPage,
    previousPage,
    goToPage,
    refresh,
  };
}
