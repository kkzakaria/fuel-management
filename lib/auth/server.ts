import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export type UserRole = "admin" | "gestionnaire" | "chauffeur" | "personnel";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  nom: string | null;
  prenom: string | null;
  telephone: string | null;
  chauffeur_id: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

/**
 * Get the current authenticated user
 * Cached per request to avoid multiple database calls
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
});

/**
 * Get the current user's profile with role information
 * Cached per request
 */
export const getCurrentUserProfile = cache(async () => {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile as UserProfile;
});

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: UserRole | UserRole[]): Promise<boolean> {
  const profile = await getCurrentUserProfile();

  if (!profile || !profile.is_active) {
    return false;
  }

  if (Array.isArray(role)) {
    return role.includes(profile.role);
  }

  return profile.role === role;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

/**
 * Check if the current user is a gestionnaire or admin
 */
export async function isGestionnaireOrAdmin(): Promise<boolean> {
  return hasRole(["admin", "gestionnaire"]);
}

/**
 * Check if the current user is a chauffeur
 */
export async function isChauffeur(): Promise<boolean> {
  return hasRole("chauffeur");
}

/**
 * Get the chauffeur_id for the current user (if they are a driver)
 */
export async function getCurrentChauffeurId(): Promise<string | null> {
  const profile = await getCurrentUserProfile();

  if (!profile || profile.role !== "chauffeur" || !profile.is_active) {
    return null;
  }

  return profile.chauffeur_id;
}

/**
 * Require authentication - throws error if not authenticated
 * Use in Server Components that require authentication
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

/**
 * Require a specific role - throws error if user doesn't have role
 */
export async function requireRole(role: UserRole | UserRole[]) {
  await requireAuth();

  const hasRequiredRole = await hasRole(role);

  if (!hasRequiredRole) {
    throw new Error("Insufficient permissions");
  }
}

/**
 * Require admin role - throws error if not admin
 */
export async function requireAdmin() {
  await requireRole("admin");
}

/**
 * Require gestionnaire or admin role
 */
export async function requireGestionnaireOrAdmin() {
  await requireRole(["admin", "gestionnaire"]);
}
