/**
 * Trajet Form Redesign - Industrial Design
 *
 * Multi-section form with:
 * - Visual step indicators
 * - Collapsible sections on mobile
 * - Warm amber accents
 * - Real-time calculations preview
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  Loader2,
  Calculator,
  Route,
  User,
  Truck,
  MapPin,
  Fuel,
  Coins,
  Package,
  FileText,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ConteneurSelector } from "./conteneur-selector";
import { FraisSelector } from "./frais-selector";
import { createTrajetAction, updateTrajetAction } from "@/lib/actions/trajets";
import {
  createTrajetSchema,
  trajetCalculations,
  type CreateTrajetInput,
} from "@/lib/validations/trajet";
import { toast } from "sonner";
import { useTrajetFormData } from "@/hooks/use-trajet-form-data";
import type { Trajet, ConteneurTrajet } from "@/lib/supabase/types";

// Section configuration
const SECTIONS = [
  {
    id: "general",
    title: "Informations",
    shortTitle: "Info",
    icon: Route,
    description: "Date, chauffeur et véhicule",
  },
  {
    id: "itineraire",
    title: "Itinéraire",
    shortTitle: "Route",
    icon: MapPin,
    description: "Départ, arrivée et kilométrage",
  },
  {
    id: "carburant",
    title: "Carburant",
    shortTitle: "Fuel",
    icon: Fuel,
    description: "Litrage et prix",
  },
  {
    id: "frais",
    title: "Frais",
    shortTitle: "Frais",
    icon: Coins,
    description: "Frais additionnels",
  },
  {
    id: "conteneurs",
    title: "Conteneurs",
    shortTitle: "Cont.",
    icon: Package,
    description: "Conteneurs à transporter",
  },
  {
    id: "observations",
    title: "Notes",
    shortTitle: "Notes",
    icon: FileText,
    description: "Commentaires",
  },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

interface TrajetFormRedesignProps {
  trajet?: Trajet & { conteneur_trajet?: ConteneurTrajet[] };
  defaultChauffeurId?: string;
  returnUrl?: string;
  onSuccess?: () => void;
}

export function TrajetFormRedesign({
  trajet,
  defaultChauffeurId,
  returnUrl,
  onSuccess,
}: TrajetFormRedesignProps) {
  const isEditing = Boolean(trajet);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState<Set<SectionId>>(
    new Set(["general", "itineraire", "conteneurs"])
  );

  // Load reference data
  const { chauffeurs, vehicules, localites, typeConteneurs, loading } =
    useTrajetFormData();

  const form = useForm<CreateTrajetInput>({
    resolver: zodResolver(createTrajetSchema),
    defaultValues: {
      date_trajet:
        trajet?.date_trajet || new Date().toISOString().split("T")[0],
      chauffeur_id: trajet?.chauffeur_id || defaultChauffeurId || "",
      vehicule_id: trajet?.vehicule_id || "",
      localite_depart_id: trajet?.localite_depart_id || "",
      localite_arrivee_id: trajet?.localite_arrivee_id || "",
      km_debut: trajet?.km_debut || 0,
      km_fin: trajet?.km_fin ?? undefined,
      litrage_prevu: trajet?.litrage_prevu || undefined,
      litrage_station: trajet?.litrage_station || undefined,
      prix_litre: trajet?.prix_litre || undefined,
      frais: [],
      statut:
        (trajet?.statut as "en_cours" | "termine" | "annule" | undefined) ||
        "en_cours",
      observations: trajet?.observations || undefined,
      conteneurs:
        trajet?.conteneur_trajet?.map((c) => ({
          type_conteneur_id: c.type_conteneur_id,
          numero_conteneur: c.numero_conteneur || "",
          statut_livraison:
            (c.statut_livraison as "en_cours" | "livre" | "retour") ||
            "en_cours",
        })) || [],
    },
  });

  // Watch form values for calculations
  const kmDebut = form.watch("km_debut");
  const kmFin = form.watch("km_fin");
  const litragePrevu = form.watch("litrage_prevu");
  const litrageStation = form.watch("litrage_station");
  const prixLitre = form.watch("prix_litre");
  const fraisWatched = form.watch("frais");
  const conteneurs = form.watch("conteneurs");
  const chauffeurId = form.watch("chauffeur_id");
  const vehiculeId = form.watch("vehicule_id");
  const localiteDepartId = form.watch("localite_depart_id");
  const localiteArriveeId = form.watch("localite_arrivee_id");

  // Auto calculations
  const [calculs, setCalculs] = useState({
    distance: 0,
    ecartLitrage: null as number | null,
    consommationAu100: null as number | null,
    montantCarburant: null as number | null,
    coutTotal: 0,
  });

  useEffect(() => {
    const distance = trajetCalculations.calculerDistance(
      kmDebut || 0,
      kmFin || 0
    );
    const ecartLitrage = trajetCalculations.calculerEcartLitrage(
      litragePrevu || null,
      litrageStation || null
    );
    const montantCarburant = (litrageStation || 0) * (prixLitre || 0);
    const consommationAu100 = trajetCalculations.calculerConsommationAu100(
      litrageStation || null,
      distance
    );
    const coutTotal = trajetCalculations.calculerCoutTotal(
      montantCarburant || null,
      fraisWatched || []
    );

    setCalculs({
      distance,
      ecartLitrage,
      consommationAu100,
      montantCarburant,
      coutTotal,
    });
  }, [kmDebut, kmFin, litragePrevu, litrageStation, prixLitre, fraisWatched]);

  // Section completion status
  const sectionStatus = useMemo(() => {
    return {
      general: Boolean(chauffeurId && vehiculeId),
      itineraire: Boolean(localiteDepartId && localiteArriveeId && kmDebut > 0),
      carburant: true, // Optional
      frais: true, // Optional
      conteneurs: conteneurs.length > 0,
      observations: true, // Optional
    };
  }, [
    chauffeurId,
    vehiculeId,
    localiteDepartId,
    localiteArriveeId,
    kmDebut,
    conteneurs,
  ]);

  const completedCount = Object.values(sectionStatus).filter(Boolean).length;

  // Toggle section
  const toggleSection = (id: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Get selected names for preview
  const selectedDepart = localites.find((l) => l.id === localiteDepartId);
  const selectedArrivee = localites.find((l) => l.id === localiteArriveeId);

  const onSubmit = async (data: CreateTrajetInput) => {
    setIsSubmitting(true);
    try {
      let result;
      if (isEditing && trajet) {
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
        result = await updateTrajetAction({ trajetId: trajet.id }, updateData);
      } else {
        result = await createTrajetAction(data);
      }

      if (result.data?.success) {
        toast.success(
          result.data.message ||
            (isEditing
              ? "Trajet mis à jour avec succès"
              : "Trajet créé avec succès")
        );
        if (onSuccess) {
          onSuccess();
        } else {
          if (isEditing && trajet) {
            router.push(`/trajets/${trajet.id}`);
          } else {
            router.push(returnUrl || "/trajets");
          }
          router.refresh();
        }
      } else {
        toast.error(
          isEditing
            ? "Erreur lors de la mise à jour du trajet"
            : "Erreur lors de la création du trajet"
        );
      }
    } catch (error) {
      console.error(
        isEditing ? "Erreur mise à jour trajet:" : "Erreur création trajet:",
        error
      );
      toast.error("Erreur lors de la création du trajet");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Progress bar - Desktop */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between rounded-xl border bg-card p-4">
            {SECTIONS.map((section, index) => {
              const Icon = section.icon;
              const isCompleted = sectionStatus[section.id];
              const isLast = index === SECTIONS.length - 1;

              return (
                <div key={section.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full",
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Icon className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <span className="hidden xl:inline">{section.title}</span>
                    <span className="xl:hidden">{section.shortTitle}</span>
                  </button>
                  {!isLast && (
                    <div className="mx-2 h-px w-8 bg-border xl:w-12" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Route preview card */}
        {(selectedDepart || selectedArrivee) && (
          <div className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                  <MapPin className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <span className="font-medium">
                  {selectedDepart?.nom || "Départ ?"}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-500" />
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {selectedArrivee?.nom || "Arrivée ?"}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800">
                  <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              {conteneurs.length > 0 && (
                <>
                  <div className="mx-2 h-4 w-px bg-border" />
                  <div className="flex items-center gap-1.5 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium dark:bg-slate-700">
                    <Package className="h-3 w-3" />
                    {conteneurs.length} conteneur
                    {conteneurs.length > 1 ? "s" : ""}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* === SECTION: Informations générales === */}
        <FormSection
          id="general"
          title="Informations générales"
          icon={Route}
          description="Date, chauffeur et véhicule assignés"
          isOpen={openSections.has("general")}
          onToggle={() => toggleSection("general")}
          isCompleted={sectionStatus.general}
        >
          <div className="grid gap-4 sm:grid-cols-2">
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
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                          {field.value ? (
                            format(new Date(field.value), "dd MMMM yyyy", {
                              locale: fr,
                            })
                          ) : (
                            <span className="text-muted-foreground">
                              Choisir une date
                            </span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date?.toISOString().split("T")[0])
                        }
                        disabled={
                          !isEditing
                            ? (date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }
                            : undefined
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Statut (edit mode only) */}
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

            {/* Chauffeur */}
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
                      options={chauffeurs.map((c) => ({
                        value: c.id,
                        label: `${c.prenom} ${c.nom}`,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Sélectionner un chauffeur"
                      searchPlaceholder="Rechercher..."
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
                  <FormLabel className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    Véhicule *
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      options={vehicules.map((v) => ({
                        value: v.id,
                        label: `${v.immatriculation}${v.marque ? ` (${v.marque})` : ""}`,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Sélectionner un véhicule"
                      searchPlaceholder="Rechercher..."
                      emptyMessage="Aucun véhicule trouvé."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* === SECTION: Itinéraire === */}
        <FormSection
          id="itineraire"
          title="Itinéraire"
          icon={MapPin}
          description="Points de départ et d'arrivée"
          isOpen={openSections.has("itineraire")}
          onToggle={() => toggleSection("itineraire")}
          isCompleted={sectionStatus.itineraire}
        >
          <div className="grid gap-4 sm:grid-cols-2">
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
                      searchPlaceholder="Rechercher..."
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
                      searchPlaceholder="Rechercher..."
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
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>Compteur au départ</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* KM fin (edit mode) */}
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
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>Compteur au retour</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Distance calculated */}
          {isEditing && calculs.distance > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
              <Calculator className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Distance parcourue: {calculs.distance} km
              </span>
            </div>
          )}
        </FormSection>

        {/* === SECTION: Carburant === */}
        <FormSection
          id="carburant"
          title="Carburant"
          icon={Fuel}
          description="Litrage prévu et prix"
          isOpen={openSections.has("carburant")}
          onToggle={() => toggleSection("carburant")}
          isCompleted={sectionStatus.carburant}
          optional
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || null)
                      }
                    />
                  </FormControl>
                  <FormDescription>Litres attendus</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Litrage acheté (edit mode) */}
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
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || null)
                        }
                      />
                    </FormControl>
                    <FormDescription>Litres réels</FormDescription>
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
                      placeholder="650"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || null)
                      }
                    />
                  </FormControl>
                  <FormDescription>Prix unitaire</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Fuel calculations (edit mode) */}
          {isEditing && (litrageStation || calculs.montantCarburant) && (
            <div className="mt-4 space-y-2">
              <div className="rounded-lg bg-muted p-3">
                <div className="grid gap-2 text-sm sm:grid-cols-3">
                  <div className="flex justify-between sm:flex-col">
                    <span className="text-muted-foreground">Écart:</span>
                    <span
                      className={cn(
                        "font-medium",
                        calculs.ecartLitrage &&
                          Math.abs(calculs.ecartLitrage) > 10 &&
                          "text-red-600"
                      )}
                    >
                      {calculs.ecartLitrage !== null
                        ? `${calculs.ecartLitrage.toFixed(1)} L`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between sm:flex-col">
                    <span className="text-muted-foreground">Conso/100km:</span>
                    <span className="font-medium">
                      {calculs.consommationAu100 !== null
                        ? `${calculs.consommationAu100.toFixed(2)} L`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between sm:flex-col">
                    <span className="text-muted-foreground">Montant:</span>
                    <span className="font-medium">
                      {calculs.montantCarburant !== null
                        ? new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "XOF",
                          }).format(calculs.montantCarburant)
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
              {calculs.ecartLitrage &&
                Math.abs(calculs.ecartLitrage) > 10 && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    Alerte: Écart de carburant supérieur à 10L
                  </div>
                )}
            </div>
          )}
        </FormSection>

        {/* === SECTION: Frais === */}
        <FormSection
          id="frais"
          title="Frais additionnels"
          icon={Coins}
          description="Péage, manutention, etc."
          isOpen={openSections.has("frais")}
          onToggle={() => toggleSection("frais")}
          isCompleted={sectionStatus.frais}
          optional
        >
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

          {/* Total cost (edit mode) */}
          {isEditing && calculs.coutTotal > 0 && (
            <div className="mt-4 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Coût total du trajet:
                </span>
                <span className="text-lg font-bold text-amber-700 dark:text-amber-400">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "XOF",
                  }).format(calculs.coutTotal)}
                </span>
              </div>
            </div>
          )}
        </FormSection>

        {/* === SECTION: Conteneurs === */}
        <FormSection
          id="conteneurs"
          title="Conteneurs"
          icon={Package}
          description="Conteneurs à transporter"
          isOpen={openSections.has("conteneurs")}
          onToggle={() => toggleSection("conteneurs")}
          isCompleted={sectionStatus.conteneurs}
          badge={
            conteneurs.length > 0
              ? `${conteneurs.length} ajouté${conteneurs.length > 1 ? "s" : ""}`
              : undefined
          }
        >
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
        </FormSection>

        {/* === SECTION: Observations === */}
        <FormSection
          id="observations"
          title="Observations"
          icon={FileText}
          description="Notes et commentaires"
          isOpen={openSections.has("observations")}
          onToggle={() => toggleSection("observations")}
          isCompleted={sectionStatus.observations}
          optional
        >
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Commentaires, remarques particulières..."
                    className="min-h-[100px] resize-none"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>Maximum 1000 caractères</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        {/* === Actions === */}
        <div className="sticky bottom-0 -mx-4 border-t bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="hidden text-sm text-muted-foreground sm:block">
              {completedCount}/{SECTIONS.length} sections complétées
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-amber-500 hover:bg-amber-600 sm:flex-none"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Enregistrer" : "Créer le trajet"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

// Reusable section component
interface FormSectionProps {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
  isCompleted: boolean;
  optional?: boolean;
  badge?: string;
  children: React.ReactNode;
}

function FormSection({
  title,
  icon: Icon,
  description,
  isOpen,
  onToggle,
  isCompleted,
  optional,
  badge,
  children,
}: FormSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className="rounded-xl border bg-card overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center justify-between p-4 text-left transition-colors",
              "hover:bg-muted/50",
              isOpen && "border-b"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  isCompleted
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{title}</span>
                  {optional && (
                    <span className="text-xs text-muted-foreground">
                      (optionnel)
                    </span>
                  )}
                  {badge && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
