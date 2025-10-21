/**
 * Hook pour gérer les détails d'un véhicule
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchVehiculeByIdClient,
  fetchVehiculeTrajetsClient,
} from "@/lib/supabase/vehicule-queries-client";
import type { Vehicule } from "@/lib/supabase/types";

export function useVehicule(vehiculeId: string) {
  const [vehicule, setVehicule] = useState<Vehicule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!vehiculeId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchVehiculeByIdClient(vehiculeId);
      setVehicule(data);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement véhicule:", err);
    } finally {
      setLoading(false);
    }
  }, [vehiculeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => {
    fetchData();
  };

  return {
    vehicule,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook pour gérer l'historique des trajets d'un véhicule
 */
export function useVehiculeTrajets(vehiculeId: string, pageSize = 10) {
  const [trajets, setTrajets] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (!vehiculeId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await fetchVehiculeTrajetsClient(vehiculeId, {
        page,
        pageSize,
      });
      setTrajets(result.trajets);
      setCount(result.count);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement trajets véhicule:", err);
    } finally {
      setLoading(false);
    }
  }, [vehiculeId, page, pageSize]);

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
