/**
 * Dialog pour enregistrer le retour d'un trajet
 * Contient le formulaire avec les informations post-voyage
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, TruckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { enregistrerRetourAction } from "@/lib/actions/trajets";
import { trajetRetourSchema, trajetCalculations, type TrajetRetourInput } from "@/lib/validations/trajet";
import { FraisSelector } from "./frais-selector";

interface TrajetRetourDialogProps {
  trajetId: string;
  kmDebut: number;
  litragePrevu?: number | null;
  onSuccess?: () => void;
}

export function TrajetRetourDialog({
  trajetId,
  kmDebut,
  litragePrevu,
  onSuccess,
}: TrajetRetourDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TrajetRetourInput>({
    resolver: zodResolver(trajetRetourSchema),
    defaultValues: {
      km_fin: undefined,
      litrage_station: undefined,
      prix_litre: undefined,
      frais: [],
      observations: undefined,
    },
  });

  const onSubmit = async (data: TrajetRetourInput) => {
    // Validation supplémentaire côté client
    if (data.km_fin <= kmDebut) {
      form.setError("km_fin", {
        message: `Le kilométrage de retour doit être supérieur à ${kmDebut} km`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await enregistrerRetourAction({ trajetId }, data);

      if (result.data?.success) {
        toast.success(result.data.message || "Retour enregistré avec succès");
        setOpen(false);
        form.reset();
        onSuccess?.();
      } else {
        toast.error("Erreur lors de l'enregistrement du retour");
      }
    } catch (error) {
      console.error("Erreur enregistrement retour:", error);
      toast.error("Erreur lors de l'enregistrement du retour");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculs en temps réel
  const kmFin = form.watch("km_fin");
  const litrageStation = form.watch("litrage_station");
  const prixLitre = form.watch("prix_litre");
  const fraisWatched = form.watch("frais");

  const distance = kmFin && kmFin > kmDebut ? kmFin - kmDebut : 0;
  const ecartLitrage = litragePrevu && litrageStation ? litrageStation - litragePrevu : null;
  const montantCarburant = litrageStation && prixLitre ? litrageStation * prixLitre : 0;
  const consommationAu100 = litrageStation && distance > 0 ? (litrageStation / distance) * 100 : null;
  const coutTotal = trajetCalculations.calculerCoutTotal(montantCarburant || null, fraisWatched || []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <TruckIcon className="mr-2 h-4 w-4" />
          Enregistrer le retour
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enregistrer le retour du trajet</DialogTitle>
          <DialogDescription>
            Renseignez les informations du retour du véhicule. Le trajet sera automatiquement marqué comme terminé.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Kilométrage */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Kilométrage départ</p>
                <p className="text-2xl font-bold">{kmDebut.toLocaleString("fr-FR")} km</p>
              </div>

              <FormField
                control={form.control}
                name="km_fin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilométrage retour *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={`> ${kmDebut}`}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Kilométrage au compteur au retour
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Distance calculée */}
            {distance > 0 && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm font-medium">
                  Distance parcourue: <span className="text-primary">{distance.toLocaleString("fr-FR")} km</span>
                </p>
              </div>
            )}

            {/* Carburant */}
            <div className="space-y-4">
              <h4 className="font-medium">Carburant</h4>
              <div className="grid gap-4 md:grid-cols-3">
                {litragePrevu && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Litrage prévu</p>
                    <p className="font-medium">{litragePrevu} L</p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="litrage_station"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Litrage acheté *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prix_litre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix au litre (XOF) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="0"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Calculs carburant */}
              {(ecartLitrage !== null || consommationAu100 !== null || montantCarburant > 0) && (
                <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
                  {ecartLitrage !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Écart litrage:</span>
                      <span className={`font-medium ${Math.abs(ecartLitrage) > 10 ? "text-destructive" : ""}`}>
                        {ecartLitrage.toFixed(1)} L
                      </span>
                    </div>
                  )}
                  {consommationAu100 !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Consommation:</span>
                      <span className="font-medium">{consommationAu100.toFixed(2)} L/100km</span>
                    </div>
                  )}
                  {montantCarburant > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Montant carburant:</span>
                      <span className="font-medium">{formatCurrency(montantCarburant)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Frais */}
            <div className="space-y-4">
              <h4 className="font-medium">Frais</h4>
              <FormField
                control={form.control}
                name="frais"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FraisSelector
                        frais={field.value || []}
                        onChange={field.onChange}
                        error={form.formState.errors.frais?.message}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Coût total */}
              <div className="rounded-lg bg-primary/10 p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Coût total du trajet:</span>
                  <span className="text-lg font-bold">{formatCurrency(coutTotal)}</span>
                </div>
              </div>
            </div>

            {/* Observations */}
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observations</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Remarques sur le trajet, incidents, etc."
                      className="min-h-[80px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum 1000 caractères
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer le retour
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
