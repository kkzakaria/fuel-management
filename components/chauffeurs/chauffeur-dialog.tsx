/**
 * Chauffeur Dialog - Professional Driver Form
 *
 * Elegant modal dialog for creating/editing drivers with:
 * - Responsive 2-column layout (desktop) / single column (mobile)
 * - Live avatar preview with initials
 * - Visual status indicators
 * - Smooth animations and transitions
 * - Integrated with Fleet Command Center aesthetic
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Phone,
  Award,
  Calendar,
  Loader2,
  X,
  Truck,
  Coffee,
  AlertTriangle,
  UserX,
  Users,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  createChauffeurSchema,
  type CreateChauffeurInput,
} from "@/lib/validations/chauffeur";
import {
  createChauffeurAction,
  updateChauffeurAction,
} from "@/lib/actions/chauffeurs";
import type { Chauffeur } from "@/lib/supabase/types";

// Status configuration with icons and colors
const STATUS_OPTIONS = [
  {
    value: "actif",
    label: "Disponible",
    icon: Users,
    color: "emerald",
    bgClass: "bg-emerald-500",
    lightBg: "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50",
    activeBg: "bg-emerald-500 text-white ring-2 ring-emerald-500 ring-offset-2",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    value: "en_voyage",
    label: "En voyage",
    icon: Truck,
    color: "blue",
    bgClass: "bg-blue-500",
    lightBg: "bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50",
    activeBg: "bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  {
    value: "en_conge",
    label: "En congé",
    icon: Coffee,
    color: "amber",
    bgClass: "bg-amber-500",
    lightBg: "bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50",
    activeBg: "bg-amber-500 text-white ring-2 ring-amber-500 ring-offset-2",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  {
    value: "suspendu",
    label: "Suspendu",
    icon: AlertTriangle,
    color: "red",
    bgClass: "bg-red-500",
    lightBg: "bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50",
    activeBg: "bg-red-500 text-white ring-2 ring-red-500 ring-offset-2",
    textClass: "text-red-600 dark:text-red-400",
  },
  {
    value: "inactif",
    label: "Inactif",
    icon: UserX,
    color: "slate",
    bgClass: "bg-slate-400",
    lightBg: "bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-700/50",
    activeBg: "bg-slate-500 text-white ring-2 ring-slate-500 ring-offset-2",
    textClass: "text-slate-600 dark:text-slate-400",
  },
] as const;

// Status options available when creating a new chauffeur
// Only "actif" (Disponible) and "inactif" make sense for new drivers
const CREATE_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  (s) => s.value === "actif" || s.value === "inactif"
);

type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

interface ChauffeurDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chauffeur?: Chauffeur | null;
  onSuccess?: () => void;
}

export function ChauffeurDialog({
  open,
  onOpenChange,
  chauffeur,
  onSuccess,
}: ChauffeurDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(chauffeur);

  const form = useForm<CreateChauffeurInput>({
    resolver: zodResolver(createChauffeurSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      telephone: "",
      numero_permis: "",
      date_embauche: undefined,
      statut: "actif",
    },
  });

  // Reset form when dialog opens/closes or chauffeur changes
  useEffect(() => {
    if (open) {
      form.reset({
        nom: chauffeur?.nom || "",
        prenom: chauffeur?.prenom || "",
        telephone: chauffeur?.telephone || "",
        numero_permis: chauffeur?.numero_permis || "",
        date_embauche: chauffeur?.date_embauche || undefined,
        statut: (chauffeur?.statut as StatusValue) || "actif",
      });
    }
  }, [open, chauffeur, form]);

  const onSubmit = async (data: CreateChauffeurInput) => {
    try {
      setLoading(true);

      let result;
      if (isEditing && chauffeur) {
        result = await updateChauffeurAction({ chauffeur_id: chauffeur.id }, data);
      } else {
        result = await createChauffeurAction(data);
      }

      if (result?.data?.success) {
        toast.success(result.data.message);
        onOpenChange(false);
        onSuccess?.();
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

  // Watch form values for live preview
  const watchedNom = form.watch("nom");
  const watchedPrenom = form.watch("prenom");
  const watchedStatut = form.watch("statut");

  const initiales = `${watchedPrenom?.charAt(0) || ""}${watchedNom?.charAt(0) || ""}`.toUpperCase() || "??";
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === watchedStatut) || STATUS_OPTIONS[0];

  const handleClose = useCallback(() => {
    if (!loading) {
      onOpenChange(false);
    }
  }, [loading, onOpenChange]);

  const FormContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        {/* Header with avatar preview */}
        <div className={cn(
          "relative overflow-hidden rounded-xl mb-6",
          "bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800",
          "dark:from-slate-700 dark:via-slate-800 dark:to-slate-900"
        )}>
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative px-4 py-5 flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center",
                "bg-white/10 backdrop-blur-sm border border-white/20",
                "text-xl font-bold text-white",
                "transition-all duration-300"
              )}>
                {initiales}
              </div>
              <div className={cn(
                "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-800",
                "transition-all duration-300",
                currentStatus.bgClass
              )} />
            </div>

            {/* Preview info */}
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-white truncate">
                {watchedPrenom || watchedNom
                  ? `${watchedPrenom || ""} ${watchedNom || ""}`.trim()
                  : "Nouveau chauffeur"}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={cn("w-2 h-2 rounded-full", currentStatus.bgClass)} />
                <span className="text-sm text-slate-300">{currentStatus.label}</span>
              </div>
            </div>

            {/* Decorative */}
            <Sparkles className="h-5 w-5 text-white/20 shrink-0" />
          </div>
        </div>

        {/* Form fields */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Name fields - 2 columns on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="prenom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Prénom <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jean-Baptiste"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Nom <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Kouassi"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contact & License - 2 columns on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="telephone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Téléphone
                  </FormLabel>
                  <FormControl>
                    <PhoneInput
                      placeholder="07 12 34 56 78"
                      defaultCountry="CI"
                      className="h-10"
                      {...field}
                      value={field.value ?? undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numero_permis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Award className="h-3.5 w-3.5 text-muted-foreground" />
                    N° Permis
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="CI-AB-123456"
                      className="h-10"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Date */}
          <FormField
            control={form.control}
            name="date_embauche"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Date d&apos;embauche
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="h-10"
                    {...field}
                    value={field.value || ""}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status Selection - Visual chips */}
          {/* In create mode: only Disponible and Inactif */}
          {/* In edit mode: all status options available */}
          <FormField
            control={form.control}
            name="statut"
            render={({ field }) => {
              const availableStatuses = isEditing ? STATUS_OPTIONS : CREATE_STATUS_OPTIONS;
              return (
              <FormItem>
                <FormLabel className="text-sm font-medium mb-3 block">
                  Statut <span className="text-destructive">*</span>
                </FormLabel>
                <div className="flex flex-wrap justify-center gap-2 pb-1">
                  {availableStatuses.map((status) => {
                    const Icon = status.icon;
                    const isSelected = field.value === status.value;

                    return (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => field.onChange(status.value)}
                        className={cn(
                          "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg",
                          "text-sm font-medium transition-all duration-200",
                          "border-2 min-w-[120px]",
                          isSelected
                            ? cn(status.activeBg, "border-transparent")
                            : cn(status.lightBg, "border-transparent", status.textClass)
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{status.label}</span>
                      </button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
              );
            }}
          />
        </div>

        {/* Footer with actions */}
        <div className="flex items-center justify-end gap-3 pt-5 pb-1 mt-5 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[100px]">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEditing ? (
              "Enregistrer"
            ) : (
              "Créer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );

  // Mobile: Use Drawer
  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="pb-2">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg font-semibold">
                {isEditing ? "Modifier le chauffeur" : "Nouveau chauffeur"}
              </DrawerTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">
            {FormContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Modifier le chauffeur" : "Nouveau chauffeur"}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6 pt-4 overflow-y-auto flex-1">
          {FormContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}
