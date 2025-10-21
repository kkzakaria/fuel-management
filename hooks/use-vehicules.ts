/**
 * Hook pour gérer la liste des véhicules avec filtres et pagination
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchVehiculesClient } from "@/lib/supabase/vehicule-queries-client";
import type { VehiculeFilters } from "@/lib/validations/vehicule";
import type { Vehicule } from "@/lib/supabase/types";

interface UseVehiculesOptions {
  initialFilters?: VehiculeFilters;
  pageSize?: number;
  autoRefresh?: number; // ms between auto-refresh
}

export function useVehicules(options?: UseVehiculesOptions) {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<VehiculeFilters>(options?.initialFilters || {});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const pageSize = options?.pageSize || 20;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchVehiculesClient({
        filters,
        page,
        pageSize,
      });
      setVehicules(result.vehicules);
      setCount(result.count);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement véhicules:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  // Charger les données initiales et quand les filtres/page changent
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh si configuré
  useEffect(() => {
    if (!options?.autoRefresh) return;

    const interval = setInterval(fetchData, options.autoRefresh);
    return () => clearInterval(interval);
  }, [options?.autoRefresh, fetchData]);

  const updateFilters = (newFilters: Partial<VehiculeFilters>) => {
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
    vehicules,
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
