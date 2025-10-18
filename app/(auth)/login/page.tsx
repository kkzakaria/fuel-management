import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion | Transport Manager",
  description: "Connectez-vous à votre compte Transport Manager",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Transport Manager</h1>
          <p className="mt-2 text-muted-foreground">
            Gestion de flotte de transport - Côte d&apos;Ivoire
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
