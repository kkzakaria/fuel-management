/**
 * Hook pour récupérer les détails d'une mission de sous-traitance
 */
import type { MissionSousTraitanceWithDetails } from "@/lib/supabase/sous-traitant-types";

"use client";

import { useState, useEffect } from "react";
import { fetchMissionSousTraitanceByIdClient } from "@/lib/supabase/sous-traitant-queries-client";

export function useMissionSousTraitance(missionId: string | null) {
  const [mission, setMission] = useState<MissionSousTraitanceWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!missionId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMissionSousTraitanceByIdClient(missionId);
        setMission(data);
      } catch (err) {
        setError(err as Error);
        console.error("Erreur chargement mission:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [missionId]);

  const refresh = async () => {
    if (!missionId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMissionSousTraitanceByIdClient(missionId);
      setMission(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    mission,
    loading,
    error,
    refresh,
  };
}
