"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "./server";

/**
 * Hook to get the current authenticated user
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

/**
 * Hook to get the current user's profile with role information
 */
export function useUserProfile() {
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Dériver l'état de chargement au lieu d'utiliser setState dans l'effet
  const loading = userLoading || profileLoading;

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      // Ne pas appeler setState synchrone ici - l'état initial est déjà null
      return;
    }

    const supabase = createClient();

    // Utiliser une promesse asynchrone pour éviter le setState synchrone
    (async () => {
      setProfileLoading(true);

      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(data as UserProfile);
      } catch {
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [user, userLoading]);

  return { profile, loading };
}

/**
 * Hook to check if user has a specific role
 */
export function useHasRole(role: string | string[]) {
  const { profile, loading } = useUserProfile();

  if (loading || !profile || !profile.is_active) {
    return { hasRole: false, loading };
  }

  const hasRequiredRole = Array.isArray(role)
    ? role.includes(profile.role)
    : profile.role === role;

  return { hasRole: hasRequiredRole, loading };
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin() {
  return useHasRole("admin");
}

/**
 * Hook to check if user is gestionnaire or admin
 */
export function useIsGestionnaireOrAdmin() {
  return useHasRole(["admin", "gestionnaire"]);
}

/**
 * Hook to check if user is chauffeur
 */
export function useIsChauffeur() {
  return useHasRole("chauffeur");
}
