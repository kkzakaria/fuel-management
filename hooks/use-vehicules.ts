/**
 * Hook pour gérer la liste des véhicules avec filtres et pagination
 * Utilise TanStack Query pour le cache et l'optimisation
 * Migré vers Nuqs pour gestion automatique des filtres via URL
 */

/* eslint-disable react-hooks/set-state-in-effect */
// ^ Exception nécessaire: Le pattern "enabled after mount" requiert setState dans useEffect
// pour activer TanStack Query APRÈS le montage et éviter "state update before mount"

"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { fetchVehiculesClient } from "@/lib/supabase/vehicule-queries-client";
import {
  vehiculeSearchParams,
  vehiculeSearchParamsToFilters,
} from "@/lib/nuqs/parsers/vehicule";

interface UseVehiculesOptions {
  pageSize?: number;
  autoRefresh?: number; // ms between auto-refresh
}

export function useVehicules(options?: UseVehiculesOptions) {
  // Utilise Nuqs pour gérer les filtres via URL
  const [searchParams, setSearchParams] = useQueryStates(vehiculeSearchParams, {
    history: "push",
    shallow: true,
  });

  const pageSize = options?.pageSize || 20;

  // Convertir les search params en filtres pour l'API
  const filters = useMemo(
    () => vehiculeSearchParamsToFilters(searchParams),
    [searchParams]
  );

  // Attendre le montage avant d'activer la query
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Utilise useQuery pour le cache automatique
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vehicules", filters, searchParams.page, pageSize],
    queryFn: () =>
      fetchVehiculesClient({ filters, page: searchParams.page, pageSize }),
    enabled: isMounted, // N'active la query qu'après le montage
    refetchInterval: options?.autoRefresh,
    refetchIntervalInBackground: false, // Ne refetch que si la fenêtre est active
    staleTime: 5 * 60 * 1000, // 5 minutes pour les véhicules
  });

  const vehicules = data?.vehicules ?? [];
  const count = data?.count ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const updateFilters = (newFilters: {
    statut?: "actif" | "maintenance" | "inactif" | "vendu" | null;
    type_carburant?: "gasoil" | "essence" | "hybride" | "electrique" | null;
    search?: string;
  }) => {
    setSearchParams({ ...newFilters, page: 1 });
  };

  const clearFilters = () => {
    setSearchParams({
      statut: null,
      type_carburant: null,
      search: "",
      page: 1,
    });
  };

  const nextPage = () => {
    if (searchParams.page < totalPages) {
      setSearchParams({ page: searchParams.page + 1 });
    }
  };

  const previousPage = () => {
    if (searchParams.page > 1) {
      setSearchParams({ page: searchParams.page - 1 });
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setSearchParams({ page: pageNumber });
    }
  };

  const refresh = async () => {
    await refetch();
  };

  // Créer un objet filters compatible avec l'ancienne API (snake_case)
  const compatibleFilters = useMemo(
    () => ({
      statut: searchParams.statut ?? undefined,
      type_carburant: searchParams.type_carburant ?? undefined,
      search: searchParams.search || undefined,
    }),
    [searchParams]
  );

  return {
    vehicules,
    loading: isLoading,
    error: error as Error | null,
    filters: compatibleFilters,
    updateFilters,
    clearFilters,
    page: searchParams.page,
    totalPages,
    count,
    pageSize,
    nextPage,
    previousPage,
    goToPage,
    refresh,
  };
}
