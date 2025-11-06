/**
 * Hook pour gérer la liste des trajets avec filtres et pagination
 * Utilise TanStack Query pour le cache et l'optimisation
 * Migré vers Nuqs pour gestion automatique des filtres via URL
 */

/* eslint-disable react-hooks/set-state-in-effect */
// ^ Exception nécessaire: Les patterns suivants requièrent setState dans useEffect:
// 1. "enabled after mount" pour activer TanStack Query APRÈS le montage
// 2. Accumulation progressive des trajets en mode infinite scroll

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { fetchTrajetsClient } from "@/lib/supabase/trajet-queries-client";
import {
  trajetSearchParams,
  trajetSearchParamsToFilters,
} from "@/lib/nuqs/parsers/trajet";
import type { TrajetListItem } from "@/components/trajets/trajet-table";

interface UseTrajetsOptions {
  pageSize?: number;
  autoRefresh?: number; // ms between auto-refresh
  mode?: "paginated" | "infinite"; // Mode de pagination
}

export function useTrajets(options?: UseTrajetsOptions) {
  // Utilise Nuqs pour gérer les filtres via URL
  const [searchParams, setSearchParams] = useQueryStates(trajetSearchParams, {
    history: "push",
    shallow: true,
  });

  const pageSize = options?.pageSize || 20;
  const mode = options?.mode || "paginated";

  // Convertir les search params en filtres pour l'API
  const filters = useMemo(
    () => trajetSearchParamsToFilters(searchParams),
    [searchParams]
  );

  // Pour le mode infinite : accumuler les trajets
  const [accumulatedTrajets, setAccumulatedTrajets] = useState<TrajetListItem[]>([]);

  // Attendre le montage avant d'activer la query
  const [isMounted, setIsMounted] = useState(false);

  // Tracker les filtres précédents pour détecter les vrais changements
  const prevFiltersRef = useRef<string>(JSON.stringify(filters));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Utilise useQuery pour le cache automatique
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["trajets", filters, searchParams.page, pageSize],
    queryFn: () =>
      fetchTrajetsClient({ filters, page: searchParams.page, pageSize }),
    enabled: isMounted, // N'active la query qu'après le montage
    refetchInterval: options?.autoRefresh,
    refetchIntervalInBackground: false, // Ne refetch que si la fenêtre est active
    staleTime: 3 * 60 * 1000, // 3 minutes pour les trajets (données fréquemment modifiées)
  });

  const currentPageTrajets = useMemo(() => data?.trajets ?? [], [data?.trajets]);
  const count = data?.count ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // En mode infinite, accumuler les trajets de toutes les pages
  useEffect(() => {
    if (mode === "infinite" && currentPageTrajets.length > 0) {
      setAccumulatedTrajets((prev) => {
        // Si c'est la page 1 ET qu'on n'a rien d'accumulé, initialiser
        if (searchParams.page === 1 && prev.length === 0) {
          return currentPageTrajets;
        }
        // Si c'est la page 1 ET qu'on a déjà des données, merger intelligemment
        if (searchParams.page === 1) {
          const existingIds = new Set(prev.map((t) => t.id));
          const newTrajets = currentPageTrajets.filter((t) => !existingIds.has(t.id));
          // Si il y a de nouveaux trajets, les ajouter au début
          return newTrajets.length > 0 ? [...newTrajets, ...prev] : prev;
        }
        // Page > 1 : accumuler normalement
        const existingIds = new Set(prev.map((t) => t.id));
        const newTrajets = currentPageTrajets.filter((t) => !existingIds.has(t.id));
        return [...prev, ...newTrajets];
      });
    }
  }, [mode, currentPageTrajets, searchParams.page]);

  // Reset accumulated data when filters change in infinite mode
  // Nuqs gère automatiquement la normalisation des filtres vides
  useEffect(() => {
    const currentFilters = JSON.stringify(filters);

    if (
      mode === "infinite" &&
      isMounted &&
      currentFilters !== prevFiltersRef.current
    ) {
      setAccumulatedTrajets([]);
      setSearchParams({ page: 1 });
      prevFiltersRef.current = currentFilters;
    }
  }, [filters, mode, isMounted, setSearchParams]);

  const trajets = mode === "infinite" ? accumulatedTrajets : currentPageTrajets;
  const hasNextPage = searchParams.page < totalPages;

  // Fonction helper pour mettre à jour les filtres via Nuqs
  const updateFilters = (newFilters: {
    chauffeurId?: string | null;
    vehiculeId?: string | null;
    localiteArriveeId?: string | null;
    dateDebut?: string | null;
    dateFin?: string | null;
    statut?: "en_cours" | "termine" | "annule" | null;
    search?: string;
  }) => {
    setSearchParams({ ...newFilters, page: 1 });
  };

  const clearFilters = () => {
    setSearchParams({
      chauffeurId: null,
      vehiculeId: null,
      localiteArriveeId: null,
      dateDebut: null,
      dateFin: null,
      statut: null,
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
    if (mode === "infinite") {
      setAccumulatedTrajets([]);
      setSearchParams({ page: 1 });
    }
    await refetch();
  };

  const loadMore = () => {
    if (hasNextPage && !isLoading) {
      setSearchParams({ page: searchParams.page + 1 });
    }
  };

  // Créer un objet filters compatible avec l'ancienne API (snake_case)
  // pour éviter de casser les composants existants
  const compatibleFilters = useMemo(
    () => ({
      chauffeur_id: searchParams.chauffeurId ?? undefined,
      vehicule_id: searchParams.vehiculeId ?? undefined,
      localite_arrivee_id: searchParams.localiteArriveeId ?? undefined,
      date_debut: searchParams.dateDebut ?? undefined,
      date_fin: searchParams.dateFin ?? undefined,
      statut: searchParams.statut ?? undefined,
      search: searchParams.search || undefined,
    }),
    [searchParams]
  );

  return {
    trajets,
    loading: isLoading,
    error: error as Error | null,
    // Expose filters en format snake_case pour compatibilité
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
    // Infinite scroll specific
    hasNextPage,
    loadMore,
    mode,
  };
}
