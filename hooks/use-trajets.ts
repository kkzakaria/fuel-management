/**
 * Hook pour gérer la liste des trajets avec filtres et pagination
 * Utilise TanStack Query pour le cache et l'optimisation
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTrajetsClient } from "@/lib/supabase/trajet-queries-client";
import type { TrajetFilters } from "@/lib/validations/trajet";

interface UseTrajetsOptions {
  initialFilters?: TrajetFilters;
  pageSize?: number;
  autoRefresh?: number; // ms between auto-refresh
}

export function useTrajets(options?: UseTrajetsOptions) {
  const [filters, setFilters] = useState<TrajetFilters>(options?.initialFilters || {});
  const [page, setPage] = useState(1);
  const pageSize = options?.pageSize || 20;

  // Utilise useQuery pour le cache automatique
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["trajets", filters, page, pageSize],
    queryFn: () => fetchTrajetsClient({ filters, page, pageSize }),
    refetchInterval: options?.autoRefresh,
    staleTime: 3 * 60 * 1000, // 3 minutes pour les trajets (données fréquemment modifiées)
  });

  const trajets = data?.trajets ?? [];
  const count = data?.count ?? 0;
  const totalPages = data?.totalPages ?? 0;

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

  const refresh = async () => {
    await refetch();
  };

  return {
    trajets,
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
