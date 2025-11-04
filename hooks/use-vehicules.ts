/**
 * Hook pour gérer la liste des véhicules avec filtres et pagination
 * Utilise TanStack Query pour le cache et l'optimisation
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchVehiculesClient } from "@/lib/supabase/vehicule-queries-client";
import type { VehiculeFilters } from "@/lib/validations/vehicule";

interface UseVehiculesOptions {
  initialFilters?: VehiculeFilters;
  pageSize?: number;
  autoRefresh?: number; // ms between auto-refresh
}

export function useVehicules(options?: UseVehiculesOptions) {
  const [filters, setFilters] = useState<VehiculeFilters>(options?.initialFilters || {});
  const [page, setPage] = useState(1);
  const pageSize = options?.pageSize || 20;

  // Utilise useQuery pour le cache automatique
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vehicules", filters, page, pageSize],
    queryFn: () => fetchVehiculesClient({ filters, page, pageSize }),
    refetchInterval: options?.autoRefresh,
    refetchIntervalInBackground: false, // Ne refetch que si la fenêtre est active
    staleTime: 5 * 60 * 1000, // 5 minutes pour les véhicules
  });

  const vehicules = data?.vehicules ?? [];
  const count = data?.count ?? 0;
  const totalPages = data?.totalPages ?? 0;

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

  const refresh = async () => {
    await refetch();
  };

  return {
    vehicules,
    loading: isLoading,
    error: error as Error | null,
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
