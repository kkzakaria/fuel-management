/**
 * Formulaire de création/modification de sous-traitant
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  createSousTraitantSchema,
  type CreateSousTraitantInput,
} from "@/lib/validations/sous-traitant";
import {
  createSousTraitantAction,
  updateSousTraitantAction,
} from "@/lib/actions/sous-traitants";
import type { SousTraitant } from "@/lib/supabase/sous-traitant-types";

interface SousTraitantFormProps {
  sousTraitant?: SousTraitant;
  onSuccess?: () => void;
}

export function SousTraitantForm({
  sousTraitant,
  onSuccess,
}: SousTraitantFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(sousTraitant);

  const form = useForm<CreateSousTraitantInput>({
    resolver: zodResolver(createSousTraitantSchema),
    defaultValues: {
      nom_entreprise: sousTraitant?.nom_entreprise || "",
      contact_principal: sousTraitant?.contact_principal || "",
      telephone: sousTraitant?.telephone || "",
      email: sousTraitant?.email || "",
      adresse: sousTraitant?.adresse || "",
      statut: (sousTraitant?.statut as "actif" | "inactif" | "blackliste") || "actif",
    },
  });

  const onSubmit = async (data: CreateSousTraitantInput) => {
    try {
      setLoading(true);

      if (isEditing) {
        const result = await updateSousTraitantAction({
          id: sousTraitant!.id,
          data,
        });
        if (result?.serverError) throw new Error(result.serverError);
        toast.success("Sous-traitant modifié avec succès");
      } else {
        const result = await createSousTraitantAction(data);
        if (result?.serverError) throw new Error(result.serverError);
        toast.success("Sous-traitant créé avec succès");
      }

      form.reset();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/sous-traitance");
        router.refresh();
      }
    } catch (error: unknown) {
      console.error("Erreur soumission formulaire:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'enregistrement"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nom entreprise */}
        <FormField
          control={form.control}
          name="nom_entreprise"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l&apos;entreprise *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="SARL Transport Express"
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contact principal */}
        <FormField
          control={form.control}
          name="contact_principal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact principal</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Kouamé Jean"
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Téléphone */}
          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <PhoneInput
                    placeholder="Entrez le numéro de téléphone"
                    defaultCountry="CI"
                    disabled={loading}
                    {...field}
                    value={field.value ?? undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="contact@entreprise.ci"
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Adresse */}
        <FormField
          control={form.control}
          name="adresse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Adresse complète de l&apos;entreprise"
                  rows={3}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Statut */}
        <FormField
          control={form.control}
          name="statut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="blackliste">Blacklisté</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Boutons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Modifier" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
