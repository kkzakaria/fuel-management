/**
 * Hook pour gérer la liste des sous-traitants avec filtres
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { SousTraitant } from "@/lib/supabase/sous-traitant-types";
import { fetchSousTraitantsClient } from "@/lib/supabase/sous-traitant-queries-client";
import type { SousTraitantFilters } from "@/lib/validations/sous-traitant";

interface UseSousTraitantsOptions {
  initialFilters?: SousTraitantFilters;
  autoRefresh?: number;
}

export function useSousTraitants(options?: UseSousTraitantsOptions) {
  const [sousTraitants, setSousTraitants] = useState<SousTraitant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<SousTraitantFilters>(
    options?.initialFilters || {}
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchSousTraitantsClient(filters);
      setSousTraitants(result);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement sous-traitants:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!options?.autoRefresh) return;
    const interval = setInterval(fetchData, options.autoRefresh);
    return () => clearInterval(interval);
  }, [options?.autoRefresh, fetchData]);

  const updateFilters = (newFilters: Partial<SousTraitantFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const refresh = () => {
    fetchData();
  };

  return {
    sousTraitants,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refresh,
  };
}
