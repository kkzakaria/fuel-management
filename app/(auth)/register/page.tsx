import { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Créer un compte | Transport Manager",
  description: "Créer un nouveau compte utilisateur (admin seulement)",
};

export default async function RegisterPage() {
  // Check if user is authenticated and is admin
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || !profile.is_active) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center p-2">
            <Image
              src="/logo.png"
              alt="Logo Transport Manager"
              width={180}
              height={98}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold">Transport Manager</h1>
          <p className="mt-2 text-muted-foreground">
            Création de compte utilisateur
          </p>
        </div>

        <RegisterForm />

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:underline"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
