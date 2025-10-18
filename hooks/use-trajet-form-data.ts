/**
 * Hook pour charger les données de référence nécessaires aux formulaires de trajets
 * (chauffeurs, véhicules, localités, types de conteneurs)
 */

"use client";

import { useState, useEffect } from "react";
import {
  fetchChauffeursActifsClient,
  fetchVehiculesActifsClient,
  fetchLocalitesClient,
  fetchTypeConteneursClient,
} from "@/lib/supabase/trajet-queries-client";

export function useTrajetFormData() {
  const [chauffeurs, setChauffeurs] = useState<any[]>([]);
  const [vehicules, setVehicules] = useState<any[]>([]);
  const [localites, setLocalites] = useState<any[]>([]);
  const [typeConteneurs, setTypeConteneurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Charger toutes les données en parallèle
        const [chauffeursData, vehiculesData, localitesData, typeConteneursData] =
          await Promise.all([
            fetchChauffeursActifsClient(),
            fetchVehiculesActifsClient(),
            fetchLocalitesClient(),
            fetchTypeConteneursClient(),
          ]);

        setChauffeurs(chauffeursData);
        setVehicules(vehiculesData);
        setLocalites(localitesData);
        setTypeConteneurs(typeConteneursData);
      } catch (err) {
        setError(err as Error);
        console.error("Erreur chargement données formulaire:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    chauffeurs,
    vehicules,
    localites,
    typeConteneurs,
    loading,
    error,
  };
}
