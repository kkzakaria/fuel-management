/**
 * Multi-step Dialog for creating a new trajet
 *
 * Features:
 * - 6-step wizard navigation
 * - Step validation before advancing
 * - Progress indicator
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
  Plus,
  ArrowRight,
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
import { Combobox } from "@/components/ui/combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ConteneurSelector } from "./conteneur-selector";
import { FraisSelector } from "./frais-selector";
import { createTrajetAction } from "@/lib/actions/trajets";
import {
  createTrajetSchema,
  type CreateTrajetInput,
} from "@/lib/validations/trajet";
import { toast } from "sonner";
import { useTrajetFormData } from "@/hooks/use-trajet-form-data";

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
    description: "Litrage prévu",
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

interface TrajetCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultChauffeurId?: string;
  onSuccess?: () => void;
}

export function TrajetCreateDialog({
  open,
  onOpenChange,
  defaultChauffeurId,
  onSuccess,
}: TrajetCreateDialogProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load reference data
  const { chauffeurs, vehicules, localites, typeConteneurs } =
    useTrajetFormData();

  const form = useForm<CreateTrajetInput>({
    resolver: zodResolver(createTrajetSchema),
    defaultValues: {
      date_trajet: new Date().toISOString().split("T")[0],
      chauffeur_id: defaultChauffeurId || "",
      vehicule_id: "",
      localite_depart_id: "",
      localite_arrivee_id: "",
      km_debut: 0,
      km_fin: undefined,
      litrage_prevu: undefined,
      litrage_station: undefined,
      prix_litre: undefined,
      frais: [],
      statut: "en_cours",
      observations: undefined,
      conteneurs: [],
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        date_trajet: new Date().toISOString().split("T")[0],
        chauffeur_id: defaultChauffeurId || "",
        vehicule_id: "",
        localite_depart_id: "",
        localite_arrivee_id: "",
        km_debut: 0,
        km_fin: undefined,
        litrage_prevu: undefined,
        litrage_station: undefined,
        prix_litre: undefined,
        frais: [],
        statut: "en_cours",
        observations: undefined,
        conteneurs: [],
      });
      setCurrentStep(0);
    }
  }, [open, defaultChauffeurId, form]);

  // Watch form values
  const chauffeurId = form.watch("chauffeur_id");
  const vehiculeId = form.watch("vehicule_id");
  const localiteDepartId = form.watch("localite_depart_id");
  const localiteArriveeId = form.watch("localite_arrivee_id");
  const kmDebut = form.watch("km_debut");
  const conteneurs = form.watch("conteneurs");

  // Get selected items for display
  const selectedChauffeur = chauffeurs.find((c) => c.id === chauffeurId);
  const selectedVehicule = vehicules.find((v) => v.id === vehiculeId);
  const selectedDepart = localites.find((l) => l.id === localiteDepartId);
  const selectedArrivee = localites.find((l) => l.id === localiteArriveeId);

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
    // Only allow going to completed steps or the next step
    if (index <= currentStep || (index === currentStep + 1 && isCurrentStepValid)) {
      setCurrentStep(index);
    }
  }, [currentStep, isCurrentStepValid]);

  // Submit form
  const onSubmit = async (data: CreateTrajetInput) => {
    setIsSubmitting(true);
    try {
      const result = await createTrajetAction(data);

      if (result.data?.success) {
        toast.success(result.data.message || "Trajet créé avec succès");
        onOpenChange(false);
        form.reset();
        onSuccess?.();
        router.refresh();
      } else {
        toast.error("Erreur lors de la création du trajet");
      }
    } catch (error) {
      console.error("Erreur création trajet:", error);
      toast.error("Erreur lors de la création du trajet");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg">Nouveau trajet</DialogTitle>
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
              const isCompleted = index < currentStep || (index === currentStep && stepValidation[step.id as keyof typeof stepValidation]);
              const isCurrent = index === currentStep;
              const isAccessible = index <= currentStep || (index === currentStep + 1 && isCurrentStepValid);

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    disabled={!isAccessible}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                      isCurrent
                        ? "bg-amber-500 text-white shadow-md"
                        : isCompleted
                          ? "bg-emerald-500 text-white"
                          : isAccessible
                            ? "bg-muted text-muted-foreground hover:bg-muted/80"
                            : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
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
                        index < currentStep ? "bg-emerald-500" : "bg-muted"
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
                          />
                        </FormControl>
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
                          />
                        </FormControl>
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
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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

                  {/* Route preview */}
                  {(selectedDepart || selectedArrivee) && (
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
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Carburant */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-blue-50/50 p-3 text-sm dark:bg-blue-950/20">
                    <p className="text-blue-700 dark:text-blue-400">
                      Cette section est optionnelle. Vous pouvez la compléter plus tard.
                    </p>
                  </div>

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
                        <FormDescription>Estimation du carburant nécessaire</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                        <span className="text-muted-foreground">Conteneurs:</span>
                        <span>{conteneurs.length} conteneur{conteneurs.length > 1 ? "s" : ""}</span>
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
              {isLastStep ? "Créer le trajet" : "Suivant"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
