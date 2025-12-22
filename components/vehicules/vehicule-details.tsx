/**
 * Composant d'affichage des détails d'un véhicule
 * Design industriel avec indicateurs de statut, statistiques et animations
 */

"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import {
  Truck,
  Calendar,
  Gauge,
  Fuel,
  TrendingUp,
  AlertTriangle,
  MapPin,
  ChevronDown,
  Clock,
  Wallet,
  Route,
  ArrowRight,
  Wrench,
  Info,
  CircleAlert,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useVehicule, useVehiculeTrajets } from "@/hooks/use-vehicule";
import { useVehiculeStats, useVehiculeAlertes } from "@/hooks/use-vehicule-stats";

// Status configuration with industrial colors
const STATUS_CONFIG = {
  actif: {
    label: "Actif",
    borderClass: "border-l-emerald-500",
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/30",
    dotClass: "bg-emerald-500",
  },
  en_reparation: {
    label: "En réparation",
    borderClass: "border-l-amber-500",
    bgClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-50 dark:bg-amber-950/30",
    dotClass: "bg-amber-500",
  },
  inactif: {
    label: "Inactif",
    borderClass: "border-l-slate-400",
    bgClass: "bg-slate-400",
    textClass: "text-slate-500 dark:text-slate-400",
    badgeBg: "bg-slate-100 dark:bg-slate-800/30",
    dotClass: "bg-slate-400",
  },
} as const;

// Fuel type configuration
const FUEL_CONFIG = {
  diesel: {
    label: "Diesel",
    bgClass: "bg-amber-100 dark:bg-amber-950/40",
    textClass: "text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-200 dark:border-amber-900/50",
  },
  gasoil: {
    label: "Gasoil",
    bgClass: "bg-amber-100 dark:bg-amber-950/40",
    textClass: "text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-200 dark:border-amber-900/50",
  },
  essence: {
    label: "Essence",
    bgClass: "bg-sky-100 dark:bg-sky-950/40",
    textClass: "text-sky-700 dark:text-sky-400",
    borderClass: "border-sky-200 dark:border-sky-900/50",
  },
} as const;

// Alert severity configuration
const ALERT_SEVERITY = {
  info: {
    icon: Info,
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    borderClass: "border-blue-200 dark:border-blue-900/50",
    textClass: "text-blue-700 dark:text-blue-400",
    iconClass: "text-blue-500",
  },
  warning: {
    icon: CircleAlert,
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    borderClass: "border-amber-200 dark:border-amber-900/50",
    textClass: "text-amber-700 dark:text-amber-400",
    iconClass: "text-amber-500",
  },
  error: {
    icon: AlertTriangle,
    bgClass: "bg-red-50 dark:bg-red-950/30",
    borderClass: "border-red-200 dark:border-red-900/50",
    textClass: "text-red-700 dark:text-red-400",
    iconClass: "text-red-500",
  },
} as const;

// Trip status for the list
const TRIP_STATUS = {
  termine: {
    label: "Terminé",
    bgClass: "bg-emerald-100 dark:bg-emerald-950/40",
    textClass: "text-emerald-700 dark:text-emerald-400",
  },
  en_cours: {
    label: "En cours",
    bgClass: "bg-amber-100 dark:bg-amber-950/40",
    textClass: "text-amber-700 dark:text-amber-400",
  },
  annule: {
    label: "Annulé",
    bgClass: "bg-slate-100 dark:bg-slate-800/40",
    textClass: "text-slate-600 dark:text-slate-400",
  },
} as const;

// Type pour les trajets avec jointures
type TrajetWithDetails = {
  id: string;
  date_trajet: string;
  parcours_total: number;
  consommation_au_100: number | null;
  litrage_station: number | null;
  prix_litre: number | null;
  ecart_litrage: number | null;
  statut: string;
  localite_depart: { nom: string; region: string | null } | null;
  localite_arrivee: { nom: string; region: string | null } | null;
  chauffeur: { nom: string; prenom: string } | null;
};

// Type pour les alertes
type AlerteMainten = {
  type: string;
  message: string;
  severite: "info" | "warning" | "error";
};

interface VehiculeDetailsProps {
  vehiculeId: string;
}

// Collapsible section wrapper for mobile
function DetailSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  className,
  delay = 0,
  badge,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  delay?: number;
  badge?: React.ReactNode;
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
            {badge}
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
  icon: Icon,
  alert,
  delay = 0,
}: {
  label: string;
  value: string | number | null;
  unit?: string;
  icon?: React.ElementType;
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
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
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

// KPI Card for statistics
function KPICard({
  label,
  value,
  unit,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card p-4",
        "animate-fade-in opacity-0"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 font-mono text-2xl font-bold tabular-nums">
        {value}
        {unit && <span className="ml-1 text-base font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}

export function VehiculeDetails({ vehiculeId }: VehiculeDetailsProps) {
  const { vehicule, loading: loadingVehicule } = useVehicule(vehiculeId);
  const { trajets, loading: loadingTrajets, count: trajetsCount } = useVehiculeTrajets(vehiculeId, 10);
  const { stats, loading: loadingStats } = useVehiculeStats(vehiculeId);
  const { alertes, loading: loadingAlertes } = useVehiculeAlertes(vehiculeId);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "-";
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loadingVehicule) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Chargement...
        </div>
      </div>
    );
  }

  if (!vehicule) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Truck className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Véhicule non trouvé</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Ce véhicule n&apos;existe pas ou a été supprimé.
        </p>
      </div>
    );
  }

  const statusConfig =
    STATUS_CONFIG[(vehicule.statut as keyof typeof STATUS_CONFIG) || "actif"] ||
    STATUS_CONFIG.actif;

  const fuelConfig = vehicule.type_carburant
    ? FUEL_CONFIG[vehicule.type_carburant as keyof typeof FUEL_CONFIG] || FUEL_CONFIG.diesel
    : null;

  // Calculate costs
  const coutParTrajet = stats && stats.nb_trajets > 0
    ? stats.cout_total / stats.nb_trajets
    : 0;
  const coutParKm = stats && stats.km_parcourus > 0
    ? stats.cout_total / stats.km_parcourus
    : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ============================================
          HEADER CARD - Vehicle Plate, Status, Brand/Model
          ============================================ */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border-l-4 bg-card",
          "border border-border/50",
          statusConfig.borderClass,
          "animate-fade-in"
        )}
      >
        {/* Alert indicator if maintenance alerts exist */}
        {alertes.length > 0 && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
              <Wrench className="h-3.5 w-3.5 text-amber-600" />
            </span>
          </div>
        )}

        <div className="p-4 md:p-6">
          {/* Vehicle plate + Status */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Vehicle plate - Industrial monospace */}
            <div className="rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-base font-bold tracking-wide text-white dark:bg-slate-800">
              {vehicule.immatriculation}
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

            {/* Fuel type badge */}
            {fuelConfig && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium",
                  fuelConfig.bgClass,
                  fuelConfig.textClass,
                  fuelConfig.borderClass
                )}
              >
                <Fuel className="h-3.5 w-3.5" />
                {fuelConfig.label}
              </span>
            )}
          </div>

          {/* Brand and Model */}
          <div className="mt-3 flex items-center gap-2 text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span className="text-sm font-medium">
              {vehicule.marque || "Marque inconnue"} {vehicule.modele || ""}
            </span>
            {vehicule.annee && (
              <>
                <span className="text-border">•</span>
                <span className="text-sm">{vehicule.annee}</span>
              </>
            )}
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
              VEHICLE INFO SECTION
              ============================================ */}
          <DetailSection title="Informations véhicule" icon={Truck} delay={50}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border/50 bg-slate-50 p-3 dark:bg-slate-900/50">
                <p className="text-xs font-medium text-muted-foreground">Immatriculation</p>
                <p className="mt-1 font-mono text-lg font-bold tracking-wide">
                  {vehicule.immatriculation}
                </p>
              </div>

              <div className="rounded-lg border border-border/50 bg-slate-50 p-3 dark:bg-slate-900/50">
                <p className="text-xs font-medium text-muted-foreground">Statut</p>
                <div className="mt-1">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-sm font-medium",
                      statusConfig.badgeBg,
                      statusConfig.textClass
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.dotClass)} />
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {vehicule.marque && (
                <div className="rounded-lg border border-border/50 bg-slate-50 p-3 dark:bg-slate-900/50">
                  <p className="text-xs font-medium text-muted-foreground">Marque</p>
                  <p className="mt-1 font-semibold">{vehicule.marque}</p>
                </div>
              )}

              {vehicule.modele && (
                <div className="rounded-lg border border-border/50 bg-slate-50 p-3 dark:bg-slate-900/50">
                  <p className="text-xs font-medium text-muted-foreground">Modèle</p>
                  <p className="mt-1 font-semibold">{vehicule.modele}</p>
                </div>
              )}

              {vehicule.annee && (
                <div className="rounded-lg border border-border/50 bg-slate-50 p-3 dark:bg-slate-900/50">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Année
                  </div>
                  <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                    {vehicule.annee}
                  </p>
                </div>
              )}

              {vehicule.type_carburant && (
                <div className="rounded-lg border border-border/50 bg-slate-50 p-3 dark:bg-slate-900/50">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Fuel className="h-3 w-3" />
                    Type carburant
                  </div>
                  <div className="mt-1">
                    {fuelConfig && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-medium",
                          fuelConfig.bgClass,
                          fuelConfig.textClass,
                          fuelConfig.borderClass
                        )}
                      >
                        {fuelConfig.label}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Kilométrage actuel - Highlighted */}
            <div className="mt-4 flex items-center justify-between rounded-lg border border-border/50 bg-slate-50 px-4 py-3 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Gauge className="h-4 w-4" />
                Kilométrage actuel
              </div>
              <span className="font-mono text-lg font-bold tabular-nums">
                {vehicule.kilometrage_actuel?.toLocaleString("fr-FR") ?? "-"}{" "}
                <span className="text-sm font-normal text-muted-foreground">km</span>
              </span>
            </div>
          </DetailSection>

          {/* ============================================
              STATISTICS KPIs
              ============================================ */}
          <DetailSection
            title="Statistiques"
            icon={TrendingUp}
            delay={100}
            badge={
              loadingStats ? (
                <span className="text-xs text-muted-foreground">Chargement...</span>
              ) : null
            }
          >
            {!stats ? (
              <p className="text-sm text-muted-foreground">Statistiques non disponibles</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <KPICard
                  label="Trajets"
                  value={stats.nb_trajets}
                  icon={Route}
                  delay={120}
                />
                <KPICard
                  label="KM parcourus"
                  value={stats.km_parcourus.toLocaleString("fr-FR")}
                  unit="km"
                  icon={MapPin}
                  delay={140}
                />
                <KPICard
                  label="Kilométrage"
                  value={stats.kilometrage_actuel.toLocaleString("fr-FR")}
                  unit="km"
                  icon={Gauge}
                  delay={160}
                />
                <KPICard
                  label="Conso. moy."
                  value={stats.conso_moyenne.toFixed(1)}
                  unit="L/100"
                  icon={Fuel}
                  delay={180}
                />
              </div>
            )}
          </DetailSection>

          {/* ============================================
              COSTS ANALYSIS
              ============================================ */}
          <DetailSection title="Analyse des coûts" icon={Wallet} delay={150}>
            {!stats ? (
              <p className="text-sm text-muted-foreground">Données non disponibles</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    <span>Coût carburant</span>
                  </div>
                  <span className="font-mono font-semibold tabular-nums">
                    {formatCurrency(stats.cout_carburant_total)} XOF
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-border/50 py-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span>Coût total (avec frais)</span>
                  </div>
                  <span className="font-mono font-semibold tabular-nums">
                    {formatCurrency(stats.cout_total)} XOF
                  </span>
                </div>

                {stats.nb_trajets > 0 && (
                  <>
                    <div className="flex items-center justify-between border-t border-border/50 pt-2 text-sm">
                      <span className="text-muted-foreground">Coût moyen par trajet</span>
                      <span className="font-mono font-medium tabular-nums">
                        {formatCurrency(coutParTrajet)} XOF
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Coût moyen par km</span>
                      <span className="font-mono font-medium tabular-nums">
                        {formatCurrency(coutParKm)} XOF
                      </span>
                    </div>
                  </>
                )}

                {/* Total bar */}
                <div
                  className={cn(
                    "flex items-center justify-between rounded-lg p-4",
                    "bg-slate-900 text-white dark:bg-slate-800"
                  )}
                >
                  <span className="font-semibold">Coût total</span>
                  <span className="font-mono text-xl font-bold tabular-nums">
                    {formatCurrency(stats.cout_total)}{" "}
                    <span className="text-sm font-normal opacity-80">XOF</span>
                  </span>
                </div>
              </div>
            )}
          </DetailSection>

          {/* ============================================
              RECENT TRIPS
              ============================================ */}
          <DetailSection
            title="Trajets récents"
            icon={MapPin}
            delay={200}
            badge={
              <Badge variant="secondary" className="ml-2 font-mono text-xs">
                {trajetsCount}
              </Badge>
            }
          >
            {loadingTrajets ? (
              <p className="text-sm text-muted-foreground">Chargement des trajets...</p>
            ) : trajets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Route className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Aucun trajet enregistré</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(trajets as TrajetWithDetails[]).map((trajet, index) => {
                  const tripStatus =
                    TRIP_STATUS[trajet.statut as keyof typeof TRIP_STATUS] || TRIP_STATUS.en_cours;
                  const hasAlert = trajet.ecart_litrage !== null && Math.abs(trajet.ecart_litrage) > 10;

                  return (
                    <Link
                      key={trajet.id}
                      href={`/trajets/${trajet.id}`}
                      className={cn(
                        "group flex items-center justify-between rounded-lg border border-border/50 bg-slate-50 p-3 transition-all hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900",
                        "animate-fade-in opacity-0"
                      )}
                      style={{ animationDelay: `${220 + index * 30}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700">
                          <MapPin className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="truncate">
                              {trajet.localite_depart?.nom || "Départ"}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate">
                              {trajet.localite_arrivee?.nom || "Arrivée"}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {format(new Date(trajet.date_trajet), "dd MMM", { locale: fr })}
                            </span>
                            {trajet.chauffeur && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {trajet.chauffeur.prenom} {trajet.chauffeur.nom.charAt(0)}.
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Distance and consumption */}
                        <div className="hidden text-right sm:block">
                          <p className="font-mono text-sm font-semibold tabular-nums">
                            {trajet.parcours_total ? `${trajet.parcours_total} km` : "-"}
                          </p>
                          {trajet.consommation_au_100 && (
                            <p
                              className={cn(
                                "text-xs tabular-nums",
                                hasAlert ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                              )}
                            >
                              {trajet.consommation_au_100.toFixed(1)} L/100
                            </p>
                          )}
                        </div>

                        {/* Status badge */}
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-xs font-medium",
                            tripStatus.bgClass,
                            tripStatus.textClass
                          )}
                        >
                          {tripStatus.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </DetailSection>

          {/* ============================================
              ALERTS
              ============================================ */}
          <DetailSection
            title="Alertes maintenance"
            icon={AlertTriangle}
            delay={250}
            badge={
              alertes.length > 0 ? (
                <Badge variant="destructive" className="ml-2 font-mono text-xs">
                  {alertes.length}
                </Badge>
              ) : null
            }
          >
            {loadingAlertes ? (
              <p className="text-sm text-muted-foreground">Chargement des alertes...</p>
            ) : alertes.length === 0 ? (
              <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                  <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-emerald-700 dark:text-emerald-400">
                    Aucune alerte
                  </p>
                  <p className="text-sm text-emerald-600/80 dark:text-emerald-400/70">
                    Ce véhicule ne nécessite pas de maintenance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {(alertes as AlerteMainten[]).map((alerte, index) => {
                  const severityConfig =
                    ALERT_SEVERITY[alerte.severite] || ALERT_SEVERITY.info;
                  const SeverityIcon = severityConfig.icon;

                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-3",
                        severityConfig.bgClass,
                        severityConfig.borderClass
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          alerte.severite === "error"
                            ? "bg-red-100 dark:bg-red-900/50"
                            : alerte.severite === "warning"
                              ? "bg-amber-100 dark:bg-amber-900/50"
                              : "bg-blue-100 dark:bg-blue-900/50"
                        )}
                      >
                        <SeverityIcon className={cn("h-4 w-4", severityConfig.iconClass)} />
                      </div>
                      <div>
                        <p className={cn("font-medium", severityConfig.textClass)}>
                          {alerte.type}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {alerte.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DetailSection>
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
                label="Kilométrage"
                value={vehicule.kilometrage_actuel?.toLocaleString("fr-FR") ?? null}
                unit="km"
                icon={Gauge}
                delay={150}
              />
              {stats && (
                <>
                  <StatCard
                    label="Trajets"
                    value={stats.nb_trajets}
                    icon={Route}
                    delay={200}
                  />
                  <StatCard
                    label="KM parcourus"
                    value={stats.km_parcourus.toLocaleString("fr-FR")}
                    unit="km"
                    icon={MapPin}
                    delay={250}
                  />
                  <StatCard
                    label="Consommation"
                    value={stats.conso_moyenne.toFixed(1)}
                    unit="L/100"
                    icon={Fuel}
                    delay={300}
                  />
                  <StatCard
                    label="Coût total"
                    value={formatCurrency(stats.cout_total)}
                    unit="XOF"
                    icon={Wallet}
                    delay={350}
                  />
                </>
              )}
            </div>

            {/* Alerts count */}
            {alertes.length > 0 && (
              <div
                className={cn(
                  "rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30",
                  "animate-fade-in opacity-0"
                )}
                style={{ animationDelay: "400ms" }}
              >
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    Alertes
                  </p>
                  <p className="font-mono text-lg font-bold tabular-nums text-amber-700 dark:text-amber-400">
                    {alertes.length}
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
      {(vehicule.created_at || vehicule.updated_at) && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/30 bg-slate-50 px-4 py-3 text-xs text-muted-foreground dark:bg-slate-900/30",
            "animate-fade-in opacity-0"
          )}
          style={{ animationDelay: "300ms" }}
        >
          {vehicule.created_at && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Créé le{" "}
              {format(new Date(vehicule.created_at), "dd/MM/yyyy à HH:mm", {
                locale: fr,
              })}
            </span>
          )}
          {vehicule.updated_at && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Modifié le{" "}
              {format(new Date(vehicule.updated_at), "dd/MM/yyyy à HH:mm", {
                locale: fr,
              })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
