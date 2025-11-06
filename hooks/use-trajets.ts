/**
 * Hook pour gérer la liste des trajets avec filtres et pagination
 * Utilise TanStack Query pour le cache et l'optimisation
 */

 
// ^ Exception nécessaire: Le pattern "enabled after mount" requiert setState dans useEffect
// pour activer TanStack Query APRÈS le montage et éviter "state update before mount"

"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTrajetsClient } from "@/lib/supabase/trajet-queries-client";
import type { TrajetFilters } from "@/lib/validations/trajet";
import type { TrajetListItem } from "@/components/trajets/trajet-table";

interface UseTrajetsOptions {
  initialFilters?: TrajetFilters;
  pageSize?: number;
  autoRefresh?: number; // ms between auto-refresh
  mode?: "paginated" | "infinite"; // Mode de pagination
}

export function useTrajets(options?: UseTrajetsOptions) {
  const [filters, setFilters] = useState<TrajetFilters>(options?.initialFilters || {});
  const [page, setPage] = useState(1);
  const pageSize = options?.pageSize || 20;
  const mode = options?.mode || "paginated";

  // Pour le mode infinite : accumuler les trajets
  const [accumulatedTrajets, setAccumulatedTrajets] = useState<TrajetListItem[]>([]);

  // Attendre le montage avant d'activer la query
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Utilise useQuery pour le cache automatique
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["trajets", filters, page, pageSize],
    queryFn: () => fetchTrajetsClient({ filters, page, pageSize }),
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
        // Si c'est la page 1, remplacer (cas de changement de filtres)
        if (page === 1) {
          return currentPageTrajets;
        }
        // Sinon, accumuler en évitant les doublons
        const existingIds = new Set(prev.map((t) => t.id));
        const newTrajets = currentPageTrajets.filter((t) => !existingIds.has(t.id));
        return [...prev, ...newTrajets];
      });
    }
  }, [mode, currentPageTrajets, page]);

  // Reset accumulated data when filters change in infinite mode
  // Utilise JSON.stringify pour détecter les vrais changements de filtres (contenu)
  // au lieu de la référence d'objet qui change à chaque render
  useEffect(() => {
    if (mode === "infinite") {
      setAccumulatedTrajets([]);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), mode]);

  const trajets = mode === "infinite" ? accumulatedTrajets : currentPageTrajets;
  const hasNextPage = page < totalPages;

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
    if (mode === "infinite") {
      setAccumulatedTrajets([]);
      setPage(1);
    }
    await refetch();
  };

  const loadMore = () => {
    if (hasNextPage && !isLoading) {
      setPage((prev) => prev + 1);
    }
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
    // Infinite scroll specific
    hasNextPage,
    loadMore,
    mode,
  };
}
