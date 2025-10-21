/**
 * Composant Formulaire véhicule
 * Création et modification de véhicules
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  createVehiculeSchema,
  type CreateVehiculeInput,
} from "@/lib/validations/vehicule";
import {
  createVehiculeAction,
  updateVehiculeAction,
} from "@/lib/actions/vehicules";
import type { Vehicule } from "@/lib/supabase/types";

interface VehiculeFormProps {
  vehicule?: Vehicule;
  onSuccess?: () => void;
}

export function VehiculeForm({ vehicule, onSuccess }: VehiculeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(vehicule);

  const form = useForm<CreateVehiculeInput>({
    resolver: zodResolver(createVehiculeSchema),
    defaultValues: {
      immatriculation: vehicule?.immatriculation || "",
      marque: vehicule?.marque || "",
      modele: vehicule?.modele || "",
      annee: vehicule?.annee || undefined,
      type_carburant:
        (vehicule?.type_carburant as
          | "gasoil"
          | "essence"
          | "hybride"
          | "electrique"
          | null) || "gasoil",
      kilometrage_actuel: vehicule?.kilometrage_actuel || 0,
      statut:
        (vehicule?.statut as
          | "actif"
          | "maintenance"
          | "inactif"
          | "vendu"
          | null) || "actif",
    },
  });

  const onSubmit = async (data: CreateVehiculeInput) => {
    try {
      setLoading(true);

      let result;
      if (isEditing) {
        result = await updateVehiculeAction({ vehicule_id: vehicule!.id }, data);
      } else {
        result = await createVehiculeAction(data);
      }

      if (result?.data?.success) {
        toast.success(result.data.message);
        form.reset();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/vehicules");
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
          : "Erreur lors de l'enregistrement du véhicule"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Immatriculation */}
          <FormField
            control={form.control}
            name="immatriculation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Immatriculation *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="CI-1234-AB"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormDescription>
                  Sera automatiquement converti en majuscules
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Marque */}
          <FormField
            control={form.control}
            name="marque"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marque</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Mercedes-Benz"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Modèle */}
          <FormField
            control={form.control}
            name="modele"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modèle</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Actros 1845"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Année */}
          <FormField
            control={form.control}
            name="annee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Année</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="2020"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type carburant */}
          <FormField
            control={form.control}
            name="type_carburant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de carburant *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gasoil">Gasoil</SelectItem>
                    <SelectItem value="essence">Essence</SelectItem>
                    <SelectItem value="hybride">Hybride</SelectItem>
                    <SelectItem value="electrique">Électrique</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Kilométrage actuel */}
          <FormField
            control={form.control}
            name="kilometrage_actuel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kilométrage actuel</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="50000"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : 0
                      )
                    }
                  />
                </FormControl>
                <FormDescription>En kilomètres</FormDescription>
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
                    <SelectItem value="maintenance">En maintenance</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                    <SelectItem value="vendu">Vendu</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
