"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { login } from "@/lib/actions/auth";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(values);

      if (result.error) {
        setError(result.error);
      } else {
        // Successful login, redirect to dashboard
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="mb-6 text-2xl font-semibold">Connexion</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="votre@email.ci"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Se connecter
          </Button>
        </form>
      </Form>

      <div className="mt-6 rounded-md border bg-muted/50 p-4 text-sm">
        <p className="mb-3 font-semibold text-foreground">Comptes de test disponibles :</p>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Admin:</span>
            <div className="flex-1">
              <p className="font-mono text-xs">admin@transport.ci</p>
              <p className="font-mono text-xs text-muted-foreground">Admin123!</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Gestionnaire:</span>
            <div className="flex-1">
              <p className="font-mono text-xs">gestionnaire@transport.ci</p>
              <p className="font-mono text-xs text-muted-foreground">Gestion123!</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Chauffeur:</span>
            <div className="flex-1">
              <p className="font-mono text-xs">chauffeur1@transport.ci</p>
              <p className="font-mono text-xs text-muted-foreground">Chauffeur123!</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Personnel:</span>
            <div className="flex-1">
              <p className="font-mono text-xs">personnel@transport.ci</p>
              <p className="font-mono text-xs text-muted-foreground">Personnel123!</p>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs italic text-muted-foreground">
          Note: Ces comptes doivent être créés via le Dashboard Supabase
        </p>
      </div>
    </div>
  );
}
