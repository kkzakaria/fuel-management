/**
 * Hook pour gérer les détails d'un chauffeur
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchChauffeurByIdClient,
  fetchChauffeurTrajetsClient,
} from "@/lib/supabase/chauffeur-queries-client";
import type { Chauffeur } from "@/lib/supabase/types";

export function useChauffeur(chauffeurId: string) {
  const [chauffeur, setChauffeur] = useState<Chauffeur | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!chauffeurId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchChauffeurByIdClient(chauffeurId);
      setChauffeur(data);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement chauffeur:", err);
    } finally {
      setLoading(false);
    }
  }, [chauffeurId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => {
    fetchData();
  };

  return {
    chauffeur,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook pour gérer l'historique des trajets d'un chauffeur
 */
export function useChauffeurTrajets(chauffeurId: string, pageSize = 10) {
  const [trajets, setTrajets] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (!chauffeurId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await fetchChauffeurTrajetsClient(chauffeurId, {
        page,
        pageSize,
      });
      setTrajets(result.trajets);
      setCount(result.count);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement trajets chauffeur:", err);
    } finally {
      setLoading(false);
    }
  }, [chauffeurId, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    trajets,
    loading,
    error,
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
