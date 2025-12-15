/**
 * Formulaire de création/modification d'un trajet
 * Avec calculs automatiques et validation en temps réel
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Loader2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConteneurSelector } from "./conteneur-selector";
import { createTrajetAction, updateTrajetAction } from "@/lib/actions/trajets";
import { createTrajetSchema, trajetCalculations, type CreateTrajetInput } from "@/lib/validations/trajet";
import { toast } from "sonner";
import { useTrajetFormData } from "@/hooks/use-trajet-form-data";
import type { Trajet, ConteneurTrajet } from "@/lib/supabase/types";

interface TrajetFormProps {
  trajet?: Trajet & { conteneur_trajet?: ConteneurTrajet[] };
  onSuccess?: () => void;
}

export function TrajetForm({ trajet, onSuccess }: TrajetFormProps) {
  const isEditing = Boolean(trajet);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les données de référence
  const { chauffeurs, vehicules, localites, typeConteneurs, loading } = useTrajetFormData();

  const form = useForm<CreateTrajetInput>({
    resolver: zodResolver(createTrajetSchema),
    defaultValues: {
      date_trajet: trajet?.date_trajet || new Date().toISOString().split("T")[0],
      chauffeur_id: trajet?.chauffeur_id || "",
      vehicule_id: trajet?.vehicule_id || "",
      localite_depart_id: trajet?.localite_depart_id || "",
      localite_arrivee_id: trajet?.localite_arrivee_id || "",
      km_debut: trajet?.km_debut || 0,
      km_fin: trajet?.km_fin ?? undefined,
      litrage_prevu: trajet?.litrage_prevu || undefined,
      litrage_station: trajet?.litrage_station || undefined,
      prix_litre: trajet?.prix_litre || undefined,
      frais_peage: trajet?.frais_peage || 0,
      autres_frais: trajet?.autres_frais || 0,
      statut: (trajet?.statut as "en_cours" | "termine" | "annule" | undefined) || "en_cours",
      observations: trajet?.observations || undefined,
      conteneurs: trajet?.conteneur_trajet?.map((c) => ({
        type_conteneur_id: c.type_conteneur_id,
        numero_conteneur: c.numero_conteneur || undefined,
        quantite: c.quantite || 1,
        statut_livraison: (c.statut_livraison as "en_cours" | "livre" | "retour") || "en_cours",
      })) || [],
    },
  });

  // Valeurs pour calculs automatiques
  const kmDebut = form.watch("km_debut");
  const kmFin = form.watch("km_fin");
  const litragePrevu = form.watch("litrage_prevu");
  const litrageStation = form.watch("litrage_station");
  const prixLitre = form.watch("prix_litre");
  const fraisPeage = form.watch("frais_peage");
  const autresFrais = form.watch("autres_frais");

  // Calculs automatiques
  const [calculs, setCalculs] = useState({
    distance: 0,
    ecartLitrage: null as number | null,
    consommationAu100: null as number | null,
    montantCarburant: null as number | null,
    coutTotal: 0,
  });

  useEffect(() => {
    const distance = trajetCalculations.calculerDistance(kmDebut || 0, kmFin || 0);
    const ecartLitrage = trajetCalculations.calculerEcartLitrage(litragePrevu || null, litrageStation || null);
    const montantCarburant = (litrageStation || 0) * (prixLitre || 0);
    const consommationAu100 = trajetCalculations.calculerConsommationAu100(litrageStation || null, distance);
    const coutTotal = trajetCalculations.calculerCoutTotal(montantCarburant || null, fraisPeage || 0, autresFrais || 0);

    setCalculs({
      distance,
      ecartLitrage,
      consommationAu100,
      montantCarburant,
      coutTotal,
    });
  }, [kmDebut, kmFin, litragePrevu, litrageStation, prixLitre, fraisPeage, autresFrais]);

  const onSubmit = async (data: CreateTrajetInput) => {
    setIsSubmitting(true);
    try {
      let result;
      if (isEditing && trajet) {
        // Mode édition
        result = await updateTrajetAction(
          { trajetId: trajet.id },
          data
        );
      } else {
        // Mode création
        result = await createTrajetAction(data);
      }

      if (result.data?.success) {
        toast.success(result.data.message || (isEditing ? "Trajet mis à jour avec succès" : "Trajet créé avec succès"));
        if (onSuccess) {
          onSuccess();
        } else {
          if (isEditing && trajet) {
            router.push(`/trajets/${trajet.id}`);
          } else {
            router.push("/trajets");
          }
          router.refresh();
        }
      } else {
        toast.error(isEditing ? "Erreur lors de la mise à jour du trajet" : "Erreur lors de la création du trajet");
      }
    } catch (error) {
      console.error(isEditing ? "Erreur mise à jour trajet:" : "Erreur création trajet:", error);
      toast.error("Erreur lors de la création du trajet");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {/* Date */}
            <FormField
              control={form.control}
              name="date_trajet"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date du trajet *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(new Date(field.value), "dd MMMM yyyy", { locale: fr })
                          ) : (
                            <span className="text-muted-foreground">Choisir une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString().split("T")[0])}
                        disabled={!isEditing ? (date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        } : undefined}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Chauffeur */}
            <FormField
              control={form.control}
              name="chauffeur_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chauffeur *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={chauffeurs.map((c) => ({
                        value: c.id,
                        label: `${c.prenom} ${c.nom}`,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Sélectionner un chauffeur"
                      searchPlaceholder="Rechercher un chauffeur..."
                      emptyMessage="Aucun chauffeur trouvé."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Véhicule */}
            <FormField
              control={form.control}
              name="vehicule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Véhicule *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={vehicules.map((v) => ({
                        value: v.id,
                        label: `${v.immatriculation}${v.marque ? ` (${v.marque} ${v.modele})` : ""}`,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Sélectionner un véhicule"
                      searchPlaceholder="Rechercher un véhicule..."
                      emptyMessage="Aucun véhicule trouvé."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Statut - Uniquement en mode édition */}
            {isEditing && (
              <FormField
                control={form.control}
                name="statut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="termine">Terminé</SelectItem>
                        <SelectItem value="annule">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Itinéraire */}
        <Card>
          <CardHeader>
            <CardTitle>Itinéraire</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {/* Localité départ */}
            <FormField
              control={form.control}
              name="localite_depart_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localité de départ *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={localites.map((l) => ({
                        value: l.id,
                        label: `${l.nom}${l.region ? ` (${l.region})` : ""}`,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Sélectionner le départ"
                      searchPlaceholder="Rechercher une localité..."
                      emptyMessage="Aucune localité trouvée."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Localité arrivée */}
            <FormField
              control={form.control}
              name="localite_arrivee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localité d&apos;arrivée *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={localites.map((l) => ({
                        value: l.id,
                        label: `${l.nom}${l.region ? ` (${l.region})` : ""}`,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Sélectionner l'arrivée"
                      searchPlaceholder="Rechercher une localité..."
                      emptyMessage="Aucune localité trouvée."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* KM début */}
            <FormField
              control={form.control}
              name="km_debut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kilométrage départ *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>Kilométrage au compteur au départ</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* KM fin - Uniquement en mode édition */}
            {isEditing && (
              <FormField
                control={form.control}
                name="km_fin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilométrage retour *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Kilométrage au compteur au retour</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Distance calculée - Uniquement en mode édition */}
            {isEditing && calculs.distance > 0 && (
              <div className="md:col-span-2">
                <div className="rounded-lg bg-muted p-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Distance parcourue: {calculs.distance} km
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Carburant */}
        <Card>
          <CardHeader>
            <CardTitle>Carburant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Litrage prévu */}
              <FormField
                control={form.control}
                name="litrage_prevu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Litrage prévu</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                      />
                    </FormControl>
                    <FormDescription>Litres attendus</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Litrage acheté - Uniquement en mode édition */}
              {isEditing && (
                <FormField
                  control={form.control}
                  name="litrage_station"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Litrage acheté</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                        />
                      </FormControl>
                      <FormDescription>Litres réellement achetés</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Prix au litre */}
              <FormField
                control={form.control}
                name="prix_litre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix au litre (XOF)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="0"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                      />
                    </FormControl>
                    <FormDescription>Prix unitaire en francs CFA</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Calculs carburant - Uniquement en mode édition */}
            {isEditing && (
              <div className="space-y-2">
                <div className="rounded-lg bg-muted p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Écart litrage:</span>
                    <span className={`font-medium ${calculs.ecartLitrage && Math.abs(calculs.ecartLitrage) > 10 ? "text-destructive" : ""}`}>
                      {calculs.ecartLitrage !== null ? `${calculs.ecartLitrage.toFixed(1)} L` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Consommation au 100km:</span>
                    <span className="font-medium">
                      {calculs.consommationAu100 !== null ? `${calculs.consommationAu100.toFixed(2)} L/100km` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Montant carburant:</span>
                    <span className="font-medium">
                      {calculs.montantCarburant !== null
                        ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(calculs.montantCarburant)
                        : "-"}
                    </span>
                  </div>
                </div>
                {calculs.ecartLitrage && Math.abs(calculs.ecartLitrage) > 10 && (
                  <p className="text-sm text-destructive">⚠️ Alerte: Écart de carburant supérieur à 10L</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Frais */}
        <Card>
          <CardHeader>
            <CardTitle>Frais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Frais péage */}
              <FormField
                control={form.control}
                name="frais_peage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frais de péage (XOF)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="0"
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Autres frais */}
              <FormField
                control={form.control}
                name="autres_frais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autres frais (XOF)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="0"
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Coût total */}
            <div className="rounded-lg bg-primary/10 p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Coût total du trajet:</span>
                <span className="text-lg font-bold">
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(calculs.coutTotal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteneurs */}
        <Card>
          <CardHeader>
            <CardTitle>Conteneurs *</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="conteneurs"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ConteneurSelector
                      typeConteneurs={typeConteneurs}
                      conteneurs={field.value}
                      onChange={field.onChange}
                      error={form.formState.errors.conteneurs?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Observations */}
        <Card>
          <CardHeader>
            <CardTitle>Observations</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Commentaires, remarques particulières..."
                      className="min-h-[100px]"
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
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Enregistrer les modifications" : "Créer le trajet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
