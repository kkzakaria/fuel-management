/**
 * Chauffeur Card Component
 *
 * Professional driver card with:
 * - Avatar with status indicator
 * - Quick info display
 * - Hover interactions
 * - Action menu
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  Calendar,
  Award,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Truck,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChauffeurDeleteDialog } from "./chauffeur-delete-dialog";
import type { Chauffeur } from "@/lib/supabase/types";

// Status configuration
const STATUS_CONFIG = {
  actif: {
    label: "Disponible",
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    bgLightClass: "bg-emerald-50 dark:bg-emerald-950/30",
    ringClass: "ring-emerald-500",
  },
  en_voyage: {
    label: "En voyage",
    bgClass: "bg-blue-500",
    textClass: "text-blue-600 dark:text-blue-400",
    bgLightClass: "bg-blue-50 dark:bg-blue-950/30",
    ringClass: "ring-blue-500",
  },
  en_conge: {
    label: "En congé",
    bgClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    bgLightClass: "bg-amber-50 dark:bg-amber-950/30",
    ringClass: "ring-amber-500",
  },
  suspendu: {
    label: "Suspendu",
    bgClass: "bg-red-500",
    textClass: "text-red-600 dark:text-red-400",
    bgLightClass: "bg-red-50 dark:bg-red-950/30",
    ringClass: "ring-red-500",
  },
  inactif: {
    label: "Inactif",
    bgClass: "bg-slate-400",
    textClass: "text-slate-500 dark:text-slate-400",
    bgLightClass: "bg-slate-100 dark:bg-slate-800/30",
    ringClass: "ring-slate-400",
  },
} as const;

interface ChauffeurCardProps {
  chauffeur: Chauffeur;
  index?: number;
}

export function ChauffeurCard({ chauffeur, index = 0 }: ChauffeurCardProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const statusConfig = STATUS_CONFIG[chauffeur.statut as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.inactif;
  const initiales = `${chauffeur.prenom?.charAt(0) || ""}${chauffeur.nom?.charAt(0) || ""}`.toUpperCase();

  const handleClick = () => {
    router.push(`/chauffeurs/${chauffeur.id}`);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          "group relative bg-card rounded-xl border overflow-hidden cursor-pointer",
          "transition-all duration-300 ease-out",
          "hover:shadow-lg hover:shadow-black/5 hover:border-primary/20",
          "hover:-translate-y-0.5",
          "opacity-0 animate-fade-in"
        )}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Status accent bar */}
        <div className={cn("absolute top-0 left-0 right-0 h-1", statusConfig.bgClass)} />

        <div className="p-4 pt-5">
          {/* Header row: Avatar + Name + Actions */}
          <div className="flex items-start gap-3 mb-4">
            {/* Avatar with status ring */}
            <div className="relative shrink-0">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br from-slate-100 to-slate-200",
                "dark:from-slate-700 dark:to-slate-800",
                "text-lg font-bold text-slate-600 dark:text-slate-300",
                "ring-2 ring-offset-2 ring-offset-card",
                statusConfig.ringClass
              )}>
                {initiales}
              </div>
              {/* Online indicator for actif */}
              {chauffeur.statut === "actif" && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card" />
              )}
            </div>

            {/* Name and status */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {chauffeur.prenom} {chauffeur.nom}
              </h3>
              <span className={cn(
                "inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md text-xs font-medium",
                statusConfig.bgLightClass,
                statusConfig.textClass
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.bgClass)} />
                {statusConfig.label}
              </span>
            </div>

            {/* Actions dropdown */}
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/chauffeurs/${chauffeur.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détails
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/chauffeurs/${chauffeur.id}/modifier`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </Link>
                  </DropdownMenuItem>
                  {chauffeur.statut === "actif" && (
                    <DropdownMenuItem asChild>
                      <Link href={`/trajets/nouveau?chauffeurId=${chauffeur.id}&returnUrl=/chauffeurs`}>
                        <Truck className="mr-2 h-4 w-4" />
                        Créer un trajet
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Info grid */}
          <div className="space-y-2 text-sm">
            {chauffeur.telephone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{chauffeur.telephone}</span>
              </div>
            )}

            {chauffeur.numero_permis && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{chauffeur.numero_permis}</span>
              </div>
            )}

            {chauffeur.date_embauche && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Depuis {format(new Date(chauffeur.date_embauche), "MMM yyyy", { locale: fr })}
                </span>
              </div>
            )}
          </div>

          {/* Footer with view details hint */}
          <div className={cn(
            "flex items-center justify-end gap-1 mt-4 pt-3 border-t",
            "text-xs text-muted-foreground",
            "opacity-0 group-hover:opacity-100 transition-opacity"
          )}>
            <span>Voir le profil</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      </div>

      <ChauffeurDeleteDialog
        chauffeur={chauffeur}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}

// Grid wrapper component
interface ChauffeurCardGridProps {
  chauffeurs: Chauffeur[];
  loading?: boolean;
}

export function ChauffeurCardGrid({ chauffeurs, loading }: ChauffeurCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-xl bg-muted animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    );
  }

  if (chauffeurs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Truck className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Aucun chauffeur trouvé</h3>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          Aucun chauffeur ne correspond à vos critères de recherche.
          Essayez de modifier vos filtres.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {chauffeurs.map((chauffeur, index) => (
        <ChauffeurCard key={chauffeur.id} chauffeur={chauffeur} index={index} />
      ))}
    </div>
  );
}
