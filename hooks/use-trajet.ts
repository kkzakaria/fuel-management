/**
 * Hook pour gérer les détails d'un trajet spécifique
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchTrajetByIdClient } from "@/lib/supabase/trajet-queries-client";

interface UseTrajetOptions {
  autoRefresh?: number; // ms between auto-refresh
}

// Type minimal pour le trajet - correspond aux données retournées par fetchTrajetByIdClient
interface Trajet {
  id: string;
  date_trajet: string;
  km_debut: number;
  km_fin: number;
  parcours_total?: number | null;
  litrage_prevu?: number | null;
  litrage_station?: number | null;
  ecart_litrage?: number | null;
  prix_litre?: number | null;
  consommation_au_100?: number | null;
  frais_peage?: number | null;
  autres_frais?: number | null;
  statut?: string | null;
  observations?: string | null;
  chauffeur?: {
    id: string;
    nom: string;
    prenom: string;
    telephone?: string | null;
    statut: string;
  } | null;
  vehicule?: {
    id: string;
    immatriculation: string;
    marque?: string | null;
    modele?: string | null;
    type_carburant?: string | null;
    statut: string;
  } | null;
  localite_depart?: {
    id: string;
    nom: string;
    region?: string | null;
  } | null;
  localite_arrivee?: {
    id: string;
    nom: string;
    region?: string | null;
  } | null;
  conteneurs?: Array<{
    id: string;
    numero_conteneur?: string | null;
    quantite?: number | null;
    statut_livraison?: string | null;
    type_conteneur?: {
      id: string;
      nom: string;
      taille_pieds: number;
      description?: string | null;
    } | null;
  }> | null;
}

export function useTrajet(trajetId: string, options?: UseTrajetOptions) {
  const [trajet, setTrajet] = useState<Trajet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!trajetId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchTrajetByIdClient(trajetId);
      setTrajet(data);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement trajet:", err);
    } finally {
      setLoading(false);
    }
  }, [trajetId]);

  // Charger les données initiales
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh si configuré
  useEffect(() => {
    if (!options?.autoRefresh) return;

    const interval = setInterval(fetchData, options.autoRefresh);
    return () => clearInterval(interval);
  }, [options?.autoRefresh, fetchData]);

  const refresh = () => {
    fetchData();
  };

  return {
    trajet,
    loading,
    error,
    refresh,
  };
}
