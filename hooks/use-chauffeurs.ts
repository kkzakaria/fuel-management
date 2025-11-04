/**
 * Hook pour gérer la liste des chauffeurs avec filtres et pagination
 * Utilise TanStack Query pour le cache et l'optimisation
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchChauffeursClient } from "@/lib/supabase/chauffeur-queries-client";
import type { ChauffeurFilters } from "@/lib/validations/chauffeur";

interface UseChauffeursOptions {
  initialFilters?: ChauffeurFilters;
  pageSize?: number;
  autoRefresh?: number; // ms between auto-refresh
}

export function useChauffeurs(options?: UseChauffeursOptions) {
  const [filters, setFilters] = useState<ChauffeurFilters>(options?.initialFilters || {});
  const [page, setPage] = useState(1);
  const pageSize = options?.pageSize || 20;

  // Utilise useQuery pour le cache automatique
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["chauffeurs", filters, page, pageSize],
    queryFn: () => fetchChauffeursClient({ filters, page, pageSize }),
    refetchInterval: options?.autoRefresh,
    staleTime: 5 * 60 * 1000, // 5 minutes pour les chauffeurs (données moins fréquemment modifiées)
  });

  const chauffeurs = data?.chauffeurs ?? [];
  const count = data?.count ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const updateFilters = (newFilters: Partial<ChauffeurFilters>) => {
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
    chauffeurs,
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
