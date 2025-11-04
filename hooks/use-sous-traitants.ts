/**
 * Hook pour gérer la liste des sous-traitants avec filtres
 * Utilise TanStack Query pour le cache et l'optimisation
 */

/* eslint-disable react-hooks/set-state-in-effect */
// ^ Exception nécessaire: Le pattern "enabled after mount" requiert setState dans useEffect
// pour activer TanStack Query APRÈS le montage et éviter "state update before mount"

"use client";

import { useState, useEffect } from "react";
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

  // Attendre le montage avant d'activer la query
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Utilise useQuery pour le cache automatique
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["sous-traitants", filters],
    queryFn: () => fetchSousTraitantsClient(filters),
    enabled: isMounted, // N'active la query qu'après le montage
    refetchInterval: options?.autoRefresh,
    refetchIntervalInBackground: false, // Ne refetch que si la fenêtre est active
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
