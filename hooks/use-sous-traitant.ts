/**
 * Hook pour récupérer les détails d'un sous-traitant avec ses missions
 */

"use client";

import { useState, useEffect } from "react";
import type { SousTraitantWithMissions } from "@/lib/supabase/sous-traitant-types";
import { fetchSousTraitantByIdClient } from "@/lib/supabase/sous-traitant-queries-client";

export function useSousTraitant(sousTraitantId: string | null) {
  const [sousTraitant, setSousTraitant] = useState<SousTraitantWithMissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sousTraitantId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSousTraitantByIdClient(sousTraitantId);
        setSousTraitant(data);
      } catch (err) {
        setError(err as Error);
        console.error("Erreur chargement sous-traitant:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sousTraitantId]);

  const refresh = async () => {
    if (!sousTraitantId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSousTraitantByIdClient(sousTraitantId);
      setSousTraitant(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    sousTraitant,
    loading,
    error,
    refresh,
  };
}
