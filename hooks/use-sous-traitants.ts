/**
 * Hook pour gérer la liste des sous-traitants avec filtres
 * Utilise TanStack Query pour le cache et l'optimisation
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSousTraitantsClient } from "@/lib/supabase/sous-traitant-queries-client";
import type { SousTraitantFilters } from "@/lib/validations/sous-traitant";

interface UseSousTraitantsOptions {
  initialFilters?: SousTraitantFilters;
  autoRefresh?: number;
}

export function useSousTraitants(options?: UseSousTraitantsOptions) {
  const [filters, setFilters] = useState<SousTraitantFilters>(
    options?.initialFilters || {}
  );

  // Utilise useQuery pour le cache automatique
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["sous-traitants", filters],
    queryFn: () => fetchSousTraitantsClient(filters),
    refetchInterval: options?.autoRefresh,
    staleTime: 5 * 60 * 1000, // 5 minutes pour les sous-traitants
  });

  const sousTraitants = data ?? [];

  const updateFilters = (newFilters: Partial<SousTraitantFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const refresh = async () => {
    await refetch();
  };

  return {
    sousTraitants,
    loading: isLoading,
    error: error as Error | null,
    filters,
    updateFilters,
    clearFilters,
    refresh,
  };
}
