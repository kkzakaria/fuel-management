/**
 * Multi-step Dialog for editing a trajet
 *
 * Features:
 * - 6-step wizard navigation
 * - Step validation before advancing
 * - Progress indicator
 * - Auto-calculated values (distance, fuel variance, etc.)
 * - Industrial design with amber accents
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  Loader2,
  Route,
  User,
  Truck,
  MapPin,
  Fuel,
  Coins,
  Package,
  FileText,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  ArrowRight,
  Calculator,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { ConteneurSelector } from "./conteneur-selector";
import { FraisSelector } from "./frais-selector";
import { updateTrajetAction } from "@/lib/actions/trajets";
import {
  createTrajetSchema,
  trajetCalculations,
  type CreateTrajetInput,
} from "@/lib/validations/trajet";
import { toast } from "sonner";
import { useTrajetFormData } from "@/hooks/use-trajet-form-data";
import type { Trajet } from "@/lib/supabase/types";

// Type for the trajet data as returned by getTrajetById
interface TrajetWithRelations extends Trajet {
  conteneur_trajet?: Array<{
    id?: string;
    type_conteneur_id: string;
    numero_conteneur?: string | null;
    quantite?: number;
    statut_livraison?: string | null;
  }>;
  conteneurs?: Array<{
    id?: string;
    type_conteneur_id: string;
    numero_conteneur?: string | null;
    quantite?: number;
    statut_livraison?: string | null;
  }>;
}

// Step configuration
const STEPS = [
  {
    id: "general",
    title: "Informations",
    icon: Route,
    description: "Date et assignation",
    required: true,
  },
  {
    id: "itineraire",
    title: "Itinéraire",
    icon: MapPin,
    description: "Départ et arrivée",
    required: true,
  },
  {
    id: "carburant",
    title: "Carburant",
    icon: Fuel,
    description: "Consommation",
    required: false,
  },
  {
    id: "frais",
    title: "Frais",
    icon: Coins,
    description: "Frais additionnels",
    required: false,
  },
  {
    id: "conteneurs",
    title: "Conteneurs",
    icon: Package,
    description: "À transporter",
    required: true,
  },
  {
    id: "observations",
    title: "Notes",
    icon: FileText,
    description: "Observations",
    required: false,
  },
] as const;

interface TrajetEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trajet: TrajetWithRelations;
  onSuccess?: () => void;
}

export function TrajetEditDialog({
  open,
  onOpenChange,
  trajet,
  onSuccess,
}: TrajetEditDialogProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load reference data
  const { chauffeurs, vehicules, localites, typeConteneurs } =
    useTrajetFormData();

  // Get conteneurs from either field (API returns 'conteneurs', direct query returns 'conteneur_trajet')
  const getConteneurs = useCallback(() => {
    const source = trajet.conteneurs || trajet.conteneur_trajet || [];
    return source.map((c) => ({
      type_conteneur_id: c.type_conteneur_id,
      numero_conteneur: c.numero_conteneur || "",
      statut_livraison: (c.statut_livraison as "en_cours" | "livre" | "retour") || "en_cours",
    }));
  }, [trajet.conteneurs, trajet.conteneur_trajet]);

  const form = useForm<CreateTrajetInput>({
    resolver: zodResolver(createTrajetSchema),
    defaultValues: {
      date_trajet: trajet.date_trajet || new Date().toISOString().split("T")[0],
      chauffeur_id: trajet.chauffeur_id || "",
      vehicule_id: trajet.vehicule_id || "",
      localite_depart_id: trajet.localite_depart_id || "",
      localite_arrivee_id: trajet.localite_arrivee_id || "",
      km_debut: trajet.km_debut || 0,
      km_fin: trajet.km_fin ?? undefined,
      litrage_prevu: trajet.litrage_prevu ?? undefined,
      litrage_station: trajet.litrage_station ?? undefined,
      prix_litre: trajet.prix_litre ?? undefined,
      frais: [],
      statut: (trajet.statut as "en_cours" | "termine" | "annule") || "en_cours",
      observations: trajet.observations ?? undefined,
      conteneurs: getConteneurs(),
    },
  });

  // Reset form when dialog opens or trajet changes
  useEffect(() => {
    if (open) {
      form.reset({
        date_trajet: trajet.date_trajet || new Date().toISOString().split("T")[0],
        chauffeur_id: trajet.chauffeur_id || "",
        vehicule_id: trajet.vehicule_id || "",
        localite_depart_id: trajet.localite_depart_id || "",
        localite_arrivee_id: trajet.localite_arrivee_id || "",
        km_debut: trajet.km_debut || 0,
        km_fin: trajet.km_fin ?? undefined,
        litrage_prevu: trajet.litrage_prevu ?? undefined,
        litrage_station: trajet.litrage_station ?? undefined,
        prix_litre: trajet.prix_litre ?? undefined,
        frais: [],
        statut: (trajet.statut as "en_cours" | "termine" | "annule") || "en_cours",
        observations: trajet.observations ?? undefined,
        conteneurs: getConteneurs(),
      });
      setCurrentStep(0);
    }
  }, [open, trajet, form, getConteneurs]);

  // Watch form values
  const chauffeurId = form.watch("chauffeur_id");
  const vehiculeId = form.watch("vehicule_id");
  const localiteDepartId = form.watch("localite_depart_id");
  const localiteArriveeId = form.watch("localite_arrivee_id");
  const kmDebut = form.watch("km_debut");
  const kmFin = form.watch("km_fin");
  const litragePrevu = form.watch("litrage_prevu");
  const litrageStation = form.watch("litrage_station");
  const prixLitre = form.watch("prix_litre");
  const conteneurs = form.watch("conteneurs");
  const fraisWatched = form.watch("frais");

  // Get selected items for display
  const selectedChauffeur = chauffeurs.find((c) => c.id === chauffeurId);
  const selectedVehicule = vehicules.find((v) => v.id === vehiculeId);
  const selectedDepart = localites.find((l) => l.id === localiteDepartId);
  const selectedArrivee = localites.find((l) => l.id === localiteArriveeId);

  // Auto-calculations
  const calculs = useMemo(() => {
    const distance = trajetCalculations.calculerDistance(kmDebut || 0, kmFin || 0);
    const ecartLitrage = trajetCalculations.calculerEcartLitrage(litragePrevu || null, litrageStation || null);
    const montantCarburant = (litrageStation || 0) * (prixLitre || 0);
    const consommationAu100 = trajetCalculations.calculerConsommationAu100(litrageStation || null, distance);
    const coutTotal = trajetCalculations.calculerCoutTotal(montantCarburant || null, fraisWatched || []);

    return {
      distance,
      ecartLitrage,
      consommationAu100,
      montantCarburant: montantCarburant > 0 ? montantCarburant : null,
      coutTotal,
    };
  }, [kmDebut, kmFin, litragePrevu, litrageStation, prixLitre, fraisWatched]);

  // Step validation
  const stepValidation = useMemo(() => {
    return {
      general: Boolean(chauffeurId && vehiculeId),
      itineraire: Boolean(localiteDepartId && localiteArriveeId && kmDebut > 0),
      carburant: true, // Optional
      frais: true, // Optional
      conteneurs: conteneurs.length > 0,
      observations: true, // Optional
    };
  }, [chauffeurId, vehiculeId, localiteDepartId, localiteArriveeId, kmDebut, conteneurs]);

  const currentStepId = STEPS[currentStep]?.id ?? "general";
  const isCurrentStepValid = stepValidation[currentStepId as keyof typeof stepValidation] ?? false;
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  // Navigate steps
  const goToNextStep = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((index: number) => {
    // In edit mode, allow going to any step since data is pre-filled
    setCurrentStep(index);
  }, []);

  // Submit form
  const onSubmit = async (data: CreateTrajetInput) => {
    setIsSubmitting(true);
    try {
      // Extract only the fields allowed by updateTrajetSchema
      const updateData = {
        date_trajet: data.date_trajet,
        km_debut: data.km_debut,
        km_fin: data.km_fin,
        litrage_prevu: data.litrage_prevu,
        litrage_station: data.litrage_station,
        prix_litre: data.prix_litre,
        frais: data.frais,
        statut: data.statut,
        observations: data.observations,
      };

      const result = await updateTrajetAction(
        { trajetId: trajet.id },
        updateData
      );

      if (result.data?.success) {
        toast.success(result.data.message || "Trajet mis à jour avec succès");
        onOpenChange(false);
        onSuccess?.();
        router.refresh();
      } else {
        toast.error("Erreur lors de la mise à jour du trajet");
      }
    } catch (error) {
      console.error("Erreur mise à jour trajet:", error);
      toast.error("Erreur lors de la mise à jour du trajet");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle next/submit button
  const handleNextOrSubmit = () => {
    if (isLastStep) {
      form.handleSubmit(onSubmit)();
    } else {
      goToNextStep();
    }
  };

  // Combobox options
  const chauffeurOptions = chauffeurs.map((c) => ({
    value: c.id,
    label: `${c.prenom} ${c.nom}`,
  }));

  const vehiculeOptions = vehicules.map((v) => ({
    value: v.id,
    label: `${v.immatriculation} - ${v.marque || ""} ${v.modele || ""}`.trim(),
  }));

  const localiteOptions = localites.map((l) => ({
    value: l.id,
    label: l.nom,
  }));

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                <Pencil className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg">Modifier le trajet</DialogTitle>
                <DialogDescription>
                  Étape {currentStep + 1} sur {STEPS.length}: {STEPS[currentStep]?.title ?? ""}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Step indicators */}
          <div className="mt-4 flex items-center justify-center gap-1">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = stepValidation[step.id as keyof typeof stepValidation];
              const isCurrent = index === currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                      isCurrent
                        ? "bg-amber-500 text-white shadow-md"
                        : isCompleted
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </button>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "mx-1 h-0.5 w-6 transition-colors",
                        stepValidation[STEPS[index + 1]?.id as keyof typeof stepValidation]
                          ? "bg-emerald-500"
                          : "bg-muted"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Form {...form}>
            <form className="space-y-4">
              {/* Step 1: Informations générales */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="date_trajet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date du trajet *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(new Date(field.value), "PPP", { locale: fr })
                                  : "Sélectionner une date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) =>
                                field.onChange(date?.toISOString().split("T")[0])
                              }
                              locale={fr}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

                  <FormField
                    control={form.control}
                    name="chauffeur_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          Chauffeur *
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            options={chauffeurOptions}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Sélectionner un chauffeur"
                            searchPlaceholder="Rechercher..."
                            emptyMessage="Aucun chauffeur trouvé"
                            disabled
                          />
                        </FormControl>
                        <FormDescription className="text-amber-600">
                          Le chauffeur ne peut pas être modifié
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicule_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          Véhicule *
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            options={vehiculeOptions}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Sélectionner un véhicule"
                            searchPlaceholder="Rechercher..."
                            emptyMessage="Aucun véhicule trouvé"
                            disabled
                          />
                        </FormControl>
                        <FormDescription className="text-amber-600">
                          Le véhicule ne peut pas être modifié
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preview */}
                  {(selectedChauffeur || selectedVehicule) && (
                    <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                      <p className="font-medium text-muted-foreground mb-2">Assignation</p>
                      {selectedChauffeur && (
                        <p><span className="text-muted-foreground">Chauffeur:</span> {selectedChauffeur.prenom} {selectedChauffeur.nom}</p>
                      )}
                      {selectedVehicule && (
                        <p><span className="text-muted-foreground">Véhicule:</span> {selectedVehicule.immatriculation}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Itinéraire */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="localite_depart_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localité de départ *</FormLabel>
                          <FormControl>
                            <Combobox
                              options={localiteOptions}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Sélectionner"
                              searchPlaceholder="Rechercher..."
                              emptyMessage="Aucune localité"
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="localite_arrivee_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localité d&apos;arrivée *</FormLabel>
                          <FormControl>
                            <Combobox
                              options={localiteOptions}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Sélectionner"
                              searchPlaceholder="Rechercher..."
                              emptyMessage="Aucune localité"
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
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
                              value={field.value || ""}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>Compteur au départ</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="km_fin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kilométrage retour</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormDescription>Compteur au retour</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Route preview with distance */}
                  <div className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{selectedDepart?.nom || "?"}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-amber-500" />
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{selectedArrivee?.nom || "?"}</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800">
                          <MapPin className="h-4 w-4 text-amber-600" />
                        </div>
                      </div>
                    </div>
                    {calculs.distance > 0 && (
                      <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                        <Calculator className="h-4 w-4 text-amber-600" />
                        <span className="font-medium text-amber-700 dark:text-amber-400">
                          Distance: {calculs.distance} km
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Carburant */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
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
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormDescription>Estimation</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormDescription>Réel</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prix_litre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix/litre (XOF)</FormLabel>
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

                  {/* Fuel calculations */}
                  <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Calculs automatiques
                    </h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Écart litrage:</span>
                        <span className={cn(
                          "font-medium",
                          calculs.ecartLitrage && Math.abs(calculs.ecartLitrage) > 10 && "text-destructive"
                        )}>
                          {calculs.ecartLitrage !== null ? `${calculs.ecartLitrage.toFixed(1)} L` : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Consommation:</span>
                        <span className="font-medium">
                          {calculs.consommationAu100 !== null ? `${calculs.consommationAu100.toFixed(2)} L/100km` : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Montant carburant:</span>
                        <span className="font-medium">
                          {calculs.montantCarburant !== null ? formatCurrency(calculs.montantCarburant) : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fuel alert */}
                  {calculs.ecartLitrage && Math.abs(calculs.ecartLitrage) > 10 && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">
                        Alerte: Écart de carburant supérieur à 10L
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Frais */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-blue-50/50 p-3 text-sm dark:bg-blue-950/20">
                    <p className="text-blue-700 dark:text-blue-400">
                      Ajoutez les frais additionnels (péage, manutention, etc.)
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="frais"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FraisSelector
                            frais={field.value || []}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Total cost */}
                  <div className="rounded-lg bg-primary/10 p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Coût total du trajet:</span>
                      <span className="text-lg font-bold">{formatCurrency(calculs.coutTotal)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Conteneurs */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="conteneurs"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ConteneurSelector
                            conteneurs={field.value || []}
                            onChange={field.onChange}
                            typeConteneurs={typeConteneurs}
                            error={form.formState.errors.conteneurs?.message}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {conteneurs.length === 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/20">
                      <p className="text-amber-700 dark:text-amber-400">
                        Ajoutez au moins un conteneur pour continuer.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 6: Observations */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observations</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notes, remarques, instructions particulières..."
                            className="min-h-[120px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>Maximum 1000 caractères</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Summary */}
                  <div className="rounded-xl border bg-muted/50 p-4 space-y-3">
                    <h4 className="font-semibold">Récapitulatif</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Chauffeur:</span>
                        <span>{selectedChauffeur ? `${selectedChauffeur.prenom} ${selectedChauffeur.nom}` : "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Véhicule:</span>
                        <span>{selectedVehicule?.immatriculation || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Itinéraire:</span>
                        <span>{selectedDepart?.nom || "?"} → {selectedArrivee?.nom || "?"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Distance:</span>
                        <span>{calculs.distance > 0 ? `${calculs.distance} km` : "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Conteneurs:</span>
                        <span>{conteneurs.length} conteneur{conteneurs.length > 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coût total:</span>
                        <span className="font-medium">{formatCurrency(calculs.coutTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={goToPreviousStep}
            disabled={isFirstStep || isSubmitting}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Précédent
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleNextOrSubmit}
              disabled={!isCurrentStepValid || isSubmitting}
              className={cn(
                isLastStep && "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isLastStep ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-2 h-4 w-4" />
              )}
              {isLastStep ? "Enregistrer" : "Suivant"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
