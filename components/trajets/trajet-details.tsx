/**
 * Composant d'affichage des détails d'un trajet
 * Design industriel avec indicateurs de statut, alertes carburant et animations
 */

"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  User,
  Truck,
  MapPin,
  Fuel,
  Wallet,
  Package,
  FileText,
  Clock,
  ArrowRight,
  ChevronDown,
  Gauge,
  AlertTriangle,
  Droplets,
  Receipt,
  Phone,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TrajetAlertBadge } from "./trajet-alert-badge";

// Status configuration with industrial colors
const STATUS_CONFIG = {
  en_cours: {
    label: "En cours",
    borderClass: "border-l-amber-500",
    bgClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-50 dark:bg-amber-950/30",
    dotClass: "bg-amber-500",
  },
  termine: {
    label: "Terminé",
    borderClass: "border-l-emerald-500",
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/30",
    dotClass: "bg-emerald-500",
  },
  annule: {
    label: "Annulé",
    borderClass: "border-l-slate-400",
    bgClass: "bg-slate-400",
    textClass: "text-slate-500 dark:text-slate-400",
    badgeBg: "bg-slate-100 dark:bg-slate-800/30",
    dotClass: "bg-slate-400",
  },
} as const;

// Delivery status config
const DELIVERY_STATUS = {
  livre: {
    label: "Livré",
    bgClass: "bg-emerald-100 dark:bg-emerald-950/40",
    textClass: "text-emerald-700 dark:text-emerald-400",
  },
  en_cours: {
    label: "En cours",
    bgClass: "bg-amber-100 dark:bg-amber-950/40",
    textClass: "text-amber-700 dark:text-amber-400",
  },
  retourne: {
    label: "Retour",
    bgClass: "bg-slate-100 dark:bg-slate-800/40",
    textClass: "text-slate-600 dark:text-slate-400",
  },
} as const;

// Type complet pour les détails d'un trajet avec toutes les relations
interface TrajetDetails {
  id: string;
  numero_trajet: string;
  date_trajet: string;
  km_debut: number | null;
  km_fin: number | null;
  parcours_total?: number | null;
  litrage_prevu: number | null;
  litrage_station: number | null;
  ecart_litrage: number | null;
  prix_litre: number | null;
  consommation_au_100: number | null;
  statut: string | null;
  observations?: string | null;
  created_at?: string;
  updated_at?: string;
  chauffeur?: {
    id: string;
    nom: string;
    prenom: string;
    telephone?: string | null;
    statut: string;
  } | null;
  vehicule?: {
    id: string;
    immatriculation: string;
    marque?: string | null;
    modele?: string | null;
    type_carburant?: string | null;
    statut: string;
  } | null;
  localite_depart?: {
    id: string;
    nom: string;
    region?: string | null;
  } | null;
  localite_arrivee?: {
    id: string;
    nom: string;
    region?: string | null;
  } | null;
  conteneurs?: Array<{
    id: string;
    numero_conteneur: string;
    statut_livraison?: string | null;
    type_conteneur?: {
      id: string;
      nom: string;
      taille_pieds: number;
      description?: string | null;
    } | null;
  }> | null;
  frais?: Array<{
    id: string;
    libelle: string;
    montant: number;
  }> | null;
}

interface TrajetDetailsProps {
  trajet: TrajetDetails;
}

// Collapsible section wrapper for mobile
function DetailSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  className,
  delay = 0,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  delay?: number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border/50 bg-card",
          "animate-fade-in opacity-0",
          className
        )}
        style={{ animationDelay: `${delay}ms` }}
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 md:cursor-default">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <Icon className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="font-semibold tracking-tight">{title}</h3>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200 md:hidden",
              isOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="md:block">
          <div className="border-t border-border/50 px-4 pb-4 pt-3">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Stat card for quick stats sidebar
function StatCard({
  label,
  value,
  unit,
  alert,
  delay = 0,
}: {
  label: string;
  value: string | number | null;
  unit?: string;
  alert?: boolean;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-slate-50 p-3 dark:bg-slate-900/50",
        "animate-fade-in opacity-0",
        alert && "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-lg font-bold tabular-nums",
          alert && "text-red-600 dark:text-red-400"
        )}
      >
        {value ?? "-"}
        {unit && <span className="ml-1 text-sm font-normal">{unit}</span>}
      </p>
    </div>
  );
}

export function TrajetDetails({ trajet }: TrajetDetailsProps) {
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "-";
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statusConfig =
    STATUS_CONFIG[(trajet.statut as keyof typeof STATUS_CONFIG) || "en_cours"] ||
    STATUS_CONFIG.en_cours;

  // Calculate costs
  const montantCarburant =
    (trajet.litrage_station || 0) * (trajet.prix_litre || 0);
  const totalFrais = trajet.frais?.reduce((sum, f) => sum + f.montant, 0) || 0;
  const coutTotal = montantCarburant + totalFrais;

  // Check alerts
  const hasEcartAlert =
    trajet.ecart_litrage !== null && Math.abs(trajet.ecart_litrage) > 10;
  const hasConsommationAlert =
    trajet.consommation_au_100 !== null && trajet.consommation_au_100 > 40;
  const hasAlert = hasEcartAlert || hasConsommationAlert;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ============================================
          HEADER CARD - Trip Number, Status, Date, Alerts
          ============================================ */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border-l-4 bg-card",
          "border border-border/50",
          statusConfig.borderClass,
          "animate-fade-in"
        )}
      >
        {/* Alert indicator - top right */}
        {hasAlert && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            </span>
          </div>
        )}

        <div className="p-4 md:p-6">
          {/* Trip number + Status */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Trip number - Industrial monospace */}
            <div className="rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-base font-bold tracking-wide text-white dark:bg-slate-800">
              {trajet.numero_trajet}
            </div>

            {/* Status badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium",
                statusConfig.badgeBg,
                statusConfig.textClass
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", statusConfig.dotClass)} />
              {statusConfig.label}
            </span>

            {/* Alert badges */}
            <TrajetAlertBadge trajet={trajet} />
          </div>

          {/* Date */}
          <div className="mt-3 flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {format(new Date(trajet.date_trajet), "EEEE d MMMM yyyy", {
                locale: fr,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================
          MAIN CONTENT GRID
          Desktop: 2 columns with sidebar
          Tablet: 2 columns
          Mobile: Single column
          ============================================ */}
      <div className="grid gap-4 lg:grid-cols-[1fr,280px] lg:gap-6">
        {/* Main content column */}
        <div className="space-y-4 md:space-y-6">
          {/* ============================================
              ROUTE SECTION - Departure → Arrival
              ============================================ */}
          <div
            className={cn(
              "overflow-hidden rounded-xl border border-border/50 bg-card",
              "animate-fade-in opacity-0"
            )}
            style={{ animationDelay: "50ms" }}
          >
            <div className="p-4 md:p-6">
              {/* Route visualization */}
              <div className="flex items-stretch gap-4">
                {/* Departure */}
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    <span>Départ</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="mt-3 flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <MapPin className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h4 className="mt-2 text-center text-lg font-semibold">
                      {trajet.localite_depart?.nom || "Non renseigné"}
                    </h4>
                    {trajet.localite_depart?.region && (
                      <p className="text-sm text-muted-foreground">
                        {trajet.localite_depart.region}
                      </p>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center justify-center px-2">
                  <div className="h-8 w-px bg-border" />
                  <div
                    className={cn(
                      "my-2 flex h-10 w-10 items-center justify-center rounded-full",
                      statusConfig.badgeBg
                    )}
                  >
                    <ArrowRight className={cn("h-5 w-5", statusConfig.textClass)} />
                  </div>
                  <div className="h-8 w-px bg-border" />
                </div>

                {/* Arrival */}
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    <span>Arrivée</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="mt-3 flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full",
                        statusConfig.badgeBg
                      )}
                    >
                      <MapPin className={cn("h-5 w-5", statusConfig.textClass)} />
                    </div>
                    <h4 className="mt-2 text-center text-lg font-semibold">
                      {trajet.localite_arrivee?.nom || "Non renseigné"}
                    </h4>
                    {trajet.localite_arrivee?.region && (
                      <p className="text-sm text-muted-foreground">
                        {trajet.localite_arrivee.region}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Distance stats */}
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-dashed border-border/50 pt-4">
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    KM Départ
                  </p>
                  <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                    {trajet.km_debut?.toLocaleString("fr-FR") ?? "-"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    KM Retour
                  </p>
                  <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                    {trajet.km_fin?.toLocaleString("fr-FR") ?? "-"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    Distance
                  </p>
                  <p
                    className={cn(
                      "mt-1 font-mono text-lg font-bold tabular-nums",
                      statusConfig.textClass
                    )}
                  >
                    {trajet.parcours_total?.toLocaleString("fr-FR") || "-"}{" "}
                    <span className="text-sm font-normal">km</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================
              DRIVER & VEHICLE - Side by side on tablet+
              ============================================ */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Driver */}
            <DetailSection title="Chauffeur" icon={User} delay={100}>
              {trajet.chauffeur ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                      <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {trajet.chauffeur.prenom} {trajet.chauffeur.nom}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-0.5 text-xs",
                          trajet.chauffeur.statut === "actif"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        )}
                      >
                        {trajet.chauffeur.statut === "actif" ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>
                  {trajet.chauffeur.telephone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{trajet.chauffeur.telephone}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Non renseigné</p>
              )}
            </DetailSection>

            {/* Vehicle */}
            <DetailSection title="Véhicule" icon={Truck} delay={150}>
              {trajet.vehicule ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                      <Truck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="font-mono text-lg font-bold tracking-wide">
                        {trajet.vehicule.immatriculation}
                      </p>
                      {trajet.vehicule.marque && (
                        <p className="text-sm text-muted-foreground">
                          {trajet.vehicule.marque} {trajet.vehicule.modele}
                        </p>
                      )}
                    </div>
                  </div>
                  {trajet.vehicule.type_carburant && (
                    <Badge
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-400"
                    >
                      <Fuel className="mr-1.5 h-3 w-3" />
                      {trajet.vehicule.type_carburant}
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Non renseigné</p>
              )}
            </DetailSection>
          </div>

          {/* ============================================
              FUEL & CONSUMPTION
              ============================================ */}
          <DetailSection
            title="Carburant et consommation"
            icon={Fuel}
            delay={200}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div
                className={cn(
                  "rounded-lg border border-border/50 bg-slate-50 p-3 dark:bg-slate-900/50"
                )}
              >
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Droplets className="h-3 w-3" />
                  Prévu
                </div>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                  {trajet.litrage_prevu ?? "-"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">L</span>
                </p>
              </div>

              <div className="rounded-lg border border-border/50 bg-slate-50 p-3 dark:bg-slate-900/50">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Fuel className="h-3 w-3" />
                  Acheté
                </div>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                  {trajet.litrage_station ?? "-"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">L</span>
                </p>
              </div>

              <div
                className={cn(
                  "rounded-lg border p-3",
                  hasEcartAlert
                    ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
                    : "border-border/50 bg-slate-50 dark:bg-slate-900/50"
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium",
                    hasEcartAlert
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  )}
                >
                  {hasEcartAlert && <AlertTriangle className="h-3 w-3" />}
                  Écart
                </div>
                <p
                  className={cn(
                    "mt-1 font-mono text-lg font-semibold tabular-nums",
                    hasEcartAlert && "text-red-600 dark:text-red-400"
                  )}
                >
                  {trajet.ecart_litrage !== null
                    ? `${trajet.ecart_litrage > 0 ? "+" : ""}${trajet.ecart_litrage.toFixed(1)}`
                    : "-"}{" "}
                  <span
                    className={cn(
                      "text-sm font-normal",
                      hasEcartAlert
                        ? "text-red-500 dark:text-red-400"
                        : "text-muted-foreground"
                    )}
                  >
                    L
                  </span>
                </p>
              </div>

              <div
                className={cn(
                  "rounded-lg border p-3",
                  hasConsommationAlert
                    ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
                    : "border-border/50 bg-slate-50 dark:bg-slate-900/50"
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium",
                    hasConsommationAlert
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  )}
                >
                  {hasConsommationAlert && <AlertTriangle className="h-3 w-3" />}
                  <Gauge className="h-3 w-3" />
                  Conso.
                </div>
                <p
                  className={cn(
                    "mt-1 font-mono text-lg font-semibold tabular-nums",
                    hasConsommationAlert && "text-red-600 dark:text-red-400"
                  )}
                >
                  {trajet.consommation_au_100 !== null
                    ? trajet.consommation_au_100.toFixed(1)
                    : "-"}{" "}
                  <span
                    className={cn(
                      "text-sm font-normal",
                      hasConsommationAlert
                        ? "text-red-500 dark:text-red-400"
                        : "text-muted-foreground"
                    )}
                  >
                    L/100
                  </span>
                </p>
              </div>
            </div>

            {/* Prix au litre */}
            <div className="mt-4 flex items-center justify-between rounded-lg border border-border/50 bg-slate-50 px-4 py-3 dark:bg-slate-900/50">
              <span className="text-sm text-muted-foreground">Prix au litre</span>
              <span className="font-mono font-semibold tabular-nums">
                {trajet.prix_litre ? formatCurrency(trajet.prix_litre) : "-"}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  XOF
                </span>
              </span>
            </div>
          </DetailSection>

          {/* ============================================
              COSTS BREAKDOWN
              ============================================ */}
          <DetailSection title="Frais et coûts" icon={Wallet} delay={250}>
            <div className="space-y-3">
              {/* Carburant */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-muted-foreground" />
                  <span>Carburant</span>
                </div>
                <span className="font-mono font-semibold tabular-nums">
                  {formatCurrency(montantCarburant)} XOF
                </span>
              </div>

              {/* Additional fees */}
              {trajet.frais && trajet.frais.length > 0 ? (
                <>
                  {trajet.frais.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between border-t border-dashed border-border/50 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span>{f.libelle}</span>
                      </div>
                      <span className="font-mono font-semibold tabular-nums">
                        {formatCurrency(f.montant)} XOF
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-border/50 pt-2 text-sm">
                    <span className="text-muted-foreground">Total frais</span>
                    <span className="font-mono font-medium tabular-nums">
                      {formatCurrency(totalFrais)} XOF
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between border-t border-dashed border-border/50 py-2 text-muted-foreground">
                  <span>Frais additionnels</span>
                  <span className="text-sm">Aucun</span>
                </div>
              )}

              {/* Total */}
              <div
                className={cn(
                  "flex items-center justify-between rounded-lg p-4",
                  "bg-slate-900 text-white dark:bg-slate-800"
                )}
              >
                <span className="font-semibold">Coût total</span>
                <span className="font-mono text-xl font-bold tabular-nums">
                  {formatCurrency(coutTotal)}{" "}
                  <span className="text-sm font-normal opacity-80">XOF</span>
                </span>
              </div>
            </div>
          </DetailSection>

          {/* ============================================
              CONTAINERS (if any)
              ============================================ */}
          {trajet.conteneurs && trajet.conteneurs.length > 0 && (
            <DetailSection
              title={`Conteneurs (${trajet.conteneurs.length})`}
              icon={Package}
              delay={300}
            >
              <div className="space-y-2">
                {trajet.conteneurs.map((c, index) => {
                  const deliveryStatus =
                    DELIVERY_STATUS[
                      c.statut_livraison as keyof typeof DELIVERY_STATUS
                    ] || DELIVERY_STATUS.en_cours;

                  return (
                    <div
                      key={c.id || index}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-slate-50 p-3 dark:bg-slate-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700">
                          <Package className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-semibold tracking-wide">
                            {c.numero_conteneur}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.type_conteneur?.nom || "Type inconnu"} (
                            {c.type_conteneur?.taille_pieds}&apos;)
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-medium",
                          deliveryStatus.bgClass,
                          deliveryStatus.textClass
                        )}
                      >
                        {deliveryStatus.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </DetailSection>
          )}

          {/* ============================================
              OBSERVATIONS (if any)
              ============================================ */}
          {trajet.observations && (
            <DetailSection title="Observations" icon={FileText} delay={350}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {trajet.observations}
              </p>
            </DetailSection>
          )}
        </div>

        {/* ============================================
            SIDEBAR - Quick Stats (Desktop only)
            ============================================ */}
        <div className="hidden space-y-4 lg:block">
          {/* Quick stats card */}
          <div
            className={cn(
              "sticky top-6 space-y-4 rounded-xl border border-border/50 bg-card p-4",
              "animate-fade-in opacity-0"
            )}
            style={{ animationDelay: "100ms" }}
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Gauge className="h-4 w-4" />
              Résumé rapide
            </h3>

            <div className="space-y-3">
              <StatCard
                label="Distance"
                value={trajet.parcours_total?.toLocaleString("fr-FR") ?? null}
                unit="km"
                delay={150}
              />
              <StatCard
                label="Carburant"
                value={trajet.litrage_station}
                unit="L"
                delay={200}
              />
              <StatCard
                label="Écart litrage"
                value={
                  trajet.ecart_litrage !== null
                    ? `${trajet.ecart_litrage > 0 ? "+" : ""}${trajet.ecart_litrage.toFixed(1)}`
                    : null
                }
                unit="L"
                alert={hasEcartAlert}
                delay={250}
              />
              <StatCard
                label="Consommation"
                value={trajet.consommation_au_100?.toFixed(1) ?? null}
                unit="L/100"
                alert={hasConsommationAlert}
                delay={300}
              />
              <StatCard
                label="Coût total"
                value={formatCurrency(coutTotal)}
                unit="XOF"
                delay={350}
              />
            </div>

            {/* Containers count */}
            {trajet.conteneurs && trajet.conteneurs.length > 0 && (
              <div
                className={cn(
                  "rounded-lg border border-border/50 bg-slate-50 p-3 dark:bg-slate-900/50",
                  "animate-fade-in opacity-0"
                )}
                style={{ animationDelay: "400ms" }}
              >
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Package className="h-3 w-3" />
                    Conteneurs
                  </p>
                  <p className="font-mono text-lg font-bold tabular-nums">
                    {trajet.conteneurs.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================
          METADATA - Timestamps
          ============================================ */}
      {(trajet.created_at || trajet.updated_at) && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/30 bg-slate-50 px-4 py-3 text-xs text-muted-foreground dark:bg-slate-900/30",
            "animate-fade-in opacity-0"
          )}
          style={{ animationDelay: "400ms" }}
        >
          {trajet.created_at && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Créé le{" "}
              {format(new Date(trajet.created_at), "dd/MM/yyyy à HH:mm", {
                locale: fr,
              })}
            </span>
          )}
          {trajet.updated_at && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Modifié le{" "}
              {format(new Date(trajet.updated_at), "dd/MM/yyyy à HH:mm", {
                locale: fr,
              })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
