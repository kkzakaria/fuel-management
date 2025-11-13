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
        <div className="mb-8 flex items-center justify-center p-2">
          <Image
            src="/logo.png"
            alt="Logo Transport Manager"
            width={180}
            height={98}
            priority
          />
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
