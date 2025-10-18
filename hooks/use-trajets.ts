/**
 * Hook pour gérer la liste des trajets avec filtres et pagination
 */

"use client";

import { useState, useEffect } from "react";
import { fetchTrajetsClient } from "@/lib/supabase/trajet-queries-client";
import type { TrajetFilters } from "@/lib/validations/trajet";

interface UseTrajetsOptions {
  initialFilters?: TrajetFilters;
  pageSize?: number;
  autoRefresh?: number; // ms between auto-refresh
}

export function useTrajets(options?: UseTrajetsOptions) {
  const [trajets, setTrajets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<TrajetFilters>(options?.initialFilters || {});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const pageSize = options?.pageSize || 20;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchTrajetsClient({
        filters,
        page,
        pageSize,
      });
      setTrajets(result.trajets);
      setCount(result.count);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement trajets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données initiales et quand les filtres/page changent
  useEffect(() => {
    fetchData();
  }, [filters, page]);

  // Auto-refresh si configuré
  useEffect(() => {
    if (!options?.autoRefresh) return;

    const interval = setInterval(fetchData, options.autoRefresh);
    return () => clearInterval(interval);
  }, [options?.autoRefresh, filters, page]);

  const updateFilters = (newFilters: Partial<TrajetFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const previousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
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
    trajets,
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
