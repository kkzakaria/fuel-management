import { Metadata } from "next";
import Image from "next/image";
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
            Gestion de flotte de transport - Côte d&apos;Ivoire
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
