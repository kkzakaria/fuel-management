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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Get user profile
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setProfile(data as UserProfile);
        setLoading(false);
      });
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
