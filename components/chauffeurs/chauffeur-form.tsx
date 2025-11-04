/**
 * Composant Formulaire chauffeur
 * Création et modification de chauffeurs
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  createChauffeurSchema,
  type CreateChauffeurInput,
} from "@/lib/validations/chauffeur";
import {
  createChauffeurAction,
  updateChauffeurAction,
} from "@/lib/actions/chauffeurs";
import type { Chauffeur } from "@/lib/supabase/types";

interface ChauffeurFormProps {
  chauffeur?: Chauffeur;
  onSuccess?: () => void;
}

export function ChauffeurForm({ chauffeur, onSuccess }: ChauffeurFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(chauffeur);

  const form = useForm<CreateChauffeurInput>({
    resolver: zodResolver(createChauffeurSchema),
    defaultValues: {
      nom: chauffeur?.nom || "",
      prenom: chauffeur?.prenom || "",
      telephone: chauffeur?.telephone || "",
      numero_permis: chauffeur?.numero_permis || "",
      date_embauche: chauffeur?.date_embauche || undefined,
      statut:
        (chauffeur?.statut as "actif" | "inactif" | "suspendu" | null) ||
        "actif",
    },
  });

  const onSubmit = async (data: CreateChauffeurInput) => {
    try {
      setLoading(true);

      let result;
      if (isEditing) {
        result = await updateChauffeurAction({ chauffeur_id: chauffeur!.id }, data);
      } else {
        result = await createChauffeurAction(data);
      }

      if (result?.data?.success) {
        toast.success(result.data.message);
        form.reset();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/chauffeurs");
          router.refresh();
        }
      } else {
        throw new Error(result?.serverError || "Erreur lors de l'enregistrement");
      }
    } catch (error: unknown) {
      console.error("Erreur soumission formulaire:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement du chauffeur"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nom */}
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom *</FormLabel>
              <FormControl>
                <Input placeholder="Kouassi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Prénom */}
        <FormField
          control={form.control}
          name="prenom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prénom *</FormLabel>
              <FormControl>
                <Input placeholder="Jean-Baptiste" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  {...field}
                  value={field.value ?? undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Numéro de permis */}
        <FormField
          control={form.control}
          name="numero_permis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro de permis</FormLabel>
              <FormControl>
                <Input
                  placeholder="ABC123456"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date d'embauche */}
        <FormField
          control={form.control}
          name="date_embauche"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date d&apos;embauche</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value || ""}
                  max={new Date().toISOString().split("T")[0]}
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
              <FormLabel>Statut *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
