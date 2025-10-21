/**
 * Hook use-user-role
 *
 * Permet d'accéder facilement au rôle de l'utilisateur connecté
 * Utile pour conditionner l'affichage de composants/actions selon les permissions
 */

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/supabase/types";

interface UseUserRoleReturn {
  role: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  isGestionnaire: boolean;
  isChauffeur: boolean;
  isPersonnel: boolean;
  canManageDrivers: boolean;
  canManageVehicles: boolean;
  canManageSubcontractors: boolean;
}

export function useUserRole(): UseUserRoleReturn {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const supabase = createClient();

        // Récupérer l'utilisateur courant
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        // Récupérer le profil avec le rôle
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Erreur récupération rôle:", error);
          setRole(null);
        } else {
          setRole(profile?.role || null);
        }
      } catch (error) {
        console.error("Erreur useUserRole:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  // Helpers pour vérifier le rôle
  const isAdmin = role === "admin";
  const isGestionnaire = role === "gestionnaire";
  const isChauffeur = role === "chauffeur";
  const isPersonnel = role === "personnel";

  // Permissions métier
  const canManageDrivers = isAdmin || isGestionnaire;
  const canManageVehicles = isAdmin || isGestionnaire;
  const canManageSubcontractors = isAdmin || isGestionnaire || isPersonnel;

  return {
    role,
    loading,
    isAdmin,
    isGestionnaire,
    isChauffeur,
    isPersonnel,
    canManageDrivers,
    canManageVehicles,
    canManageSubcontractors,
  };
}
