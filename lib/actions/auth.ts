"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  role: z.enum(["admin", "gestionnaire", "chauffeur", "personnel"]),
  nom: z.string().min(2),
  prenom: z.string().min(2),
  telephone: z.string().optional(),
});

export async function login(values: z.infer<typeof loginSchema>) {
  try {
    const validatedFields = loginSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Données invalides" };
    }

    const { email, password } = validatedFields.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: "Email ou mot de passe incorrect" };
    }

    // Check if user account is active
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", data.user.id)
      .single();

    if (!profile || !profile.is_active) {
      // Sign out if account is not active
      await supabase.auth.signOut();
      return { error: "Compte désactivé. Contactez l'administrateur." };
    }

    return { success: true };
  } catch {
    return { error: "Une erreur est survenue" };
  }
}

export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch {
    return { error: "Erreur lors de la déconnexion" };
  }
}

export async function register(values: z.infer<typeof registerSchema>) {
  try {
    const validatedFields = registerSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Données invalides" };
    }

    const { email, password, role, nom, prenom, telephone } =
      validatedFields.data;

    const supabase = await createClient();

    // Verify current user is admin
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return { error: "Non autorisé" };
    }

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", currentUser.id)
      .single();

    if (
      !currentProfile ||
      currentProfile.role !== "admin" ||
      !currentProfile.is_active
    ) {
      return { error: "Seuls les administrateurs peuvent créer des comptes" };
    }

    // Create user via Supabase Admin API
    // Note: This requires admin privileges - in production, this should use the service role key
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since admin creates manually
    });

    if (error) {
      if (error.message.includes("already registered")) {
        return { error: "Cet email est déjà utilisé" };
      }
      return { error: "Erreur lors de la création du compte" };
    }

    // Update profile with role and personal info
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role,
        nom,
        prenom,
        telephone: telephone || null,
        is_active: true,
      })
      .eq("id", data.user.id);

    if (profileError) {
      // Rollback: delete the created user
      await supabase.auth.admin.deleteUser(data.user.id);
      return { error: "Erreur lors de la configuration du profil" };
    }

    return { success: true };
  } catch {
    return { error: "Une erreur est survenue" };
  }
}
