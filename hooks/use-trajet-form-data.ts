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

interface Chauffeur {
  id: string;
  nom: string;
  prenom: string;
  telephone?: string | null;
  statut: string;
}

interface Vehicule {
  id: string;
  immatriculation: string;
  marque?: string | null;
  modele?: string | null;
  type_carburant?: string | null;
  statut: string;
}

interface Localite {
  id: string;
  nom: string;
  region?: string | null;
}

interface TypeConteneur {
  id: string;
  nom: string;
  taille_pieds: number;
  description?: string | null;
}

export function useTrajetFormData() {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [localites, setLocalites] = useState<Localite[]>([]);
  const [typeConteneurs, setTypeConteneurs] = useState<TypeConteneur[]>([]);
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
        const error = err instanceof Error ? err : new Error("Erreur inconnue lors du chargement des données");
        setError(error);
        console.error("Erreur chargement données formulaire:", error.message);
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
