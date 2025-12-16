/**
 * Chauffeur Details Component
 *
 * Professional "Driver Command Profile" design with:
 * - Hero profile section with avatar and quick stats
 * - Responsive layout (desktop sidebar / mobile stacked)
 * - Enhanced visual hierarchy and animations
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  User,
  Phone,
  Calendar,
  Award,
  TrendingUp,
  Truck,
  MapPin,
  Fuel,
  Package,
  Route,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useChauffeur, useChauffeurTrajets } from "@/hooks/use-chauffeur";
import { useChauffeurStats } from "@/hooks/use-chauffeur-stats";
import { ChauffeurCreateTripButton } from "./chauffeur-create-trip-button";

// Type pour les trajets avec jointures
type TrajetWithDetails = {
  id: string;
  date_trajet: string;
  parcours_total: number;
  consommation_au_100: number | null;
  litrage_station: number | null;
  prix_litre: number | null;
  statut: string;
  localite_depart: { nom: string; region: string | null } | null;
  localite_arrivee: { nom: string; region: string | null } | null;
  vehicule: { immatriculation: string; marque: string | null; modele: string | null } | null;
};

// Configuration des statuts avec couleurs
const STATUS_CONFIG = {
  actif: {
    label: "Disponible",
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-500",
    bgLightClass: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-500",
  },
  en_voyage: {
    label: "En voyage",
    bgClass: "bg-blue-500",
    textClass: "text-blue-500",
    bgLightClass: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-500",
  },
  en_conge: {
    label: "En congé",
    bgClass: "bg-amber-500",
    textClass: "text-amber-500",
    bgLightClass: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-500",
  },
  suspendu: {
    label: "Suspendu",
    bgClass: "bg-red-500",
    textClass: "text-red-500",
    bgLightClass: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-500",
  },
  inactif: {
    label: "Inactif",
    bgClass: "bg-slate-400",
    textClass: "text-slate-500",
    bgLightClass: "bg-slate-100 dark:bg-slate-800/50",
    borderColor: "border-slate-400",
  },
} as const;

type TabId = "informations" | "trajets" | "statistiques";

interface ChauffeurDetailsProps {
  chauffeurId: string;
}

export function ChauffeurDetails({ chauffeurId }: ChauffeurDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("informations");
  const { chauffeur, loading: loadingChauffeur } = useChauffeur(chauffeurId);
  const { trajets, loading: loadingTrajets, count: trajetsCount } = useChauffeurTrajets(chauffeurId, 10);
  const { stats, loading: loadingStats } = useChauffeurStats(chauffeurId);

  // Loading state
  if (loadingChauffeur) {
    return <ChauffeurDetailsSkeleton />;
  }

  // Not found state
  if (!chauffeur) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Chauffeur non trouvé</h3>
        <p className="text-muted-foreground text-sm text-center">
          Ce chauffeur n&apos;existe pas ou a été supprimé.
        </p>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[chauffeur.statut as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.inactif;
  const initiales = `${chauffeur.prenom?.charAt(0) || ""}${chauffeur.nom?.charAt(0) || ""}`.toUpperCase();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const tabs = [
    { id: "informations" as const, label: "Profil", icon: User },
    { id: "trajets" as const, label: "Trajets", icon: Truck, count: trajetsCount },
    { id: "statistiques" as const, label: "Stats", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 opacity-0 animate-fade-in" style={{ animationDelay: "0ms" }}>
      {/* Hero Profile Section */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
        "dark:from-slate-800 dark:via-slate-900 dark:to-slate-950"
      )}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative px-6 py-8 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className={cn(
                "w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center",
                "bg-white/10 backdrop-blur-sm border-2 border-white/20",
                "text-3xl sm:text-4xl font-bold text-white",
                "shadow-2xl"
              )}>
                {initiales}
              </div>
              {/* Status indicator */}
              <div className={cn(
                "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-slate-900",
                statusConfig.bgClass
              )} />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {chauffeur.prenom} {chauffeur.nom}
                </h1>
                <span className={cn(
                  "inline-flex items-center self-center sm:self-auto px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                  statusConfig.bgClass, "text-white"
                )}>
                  {statusConfig.label}
                </span>
              </div>

              {/* Quick info row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-slate-300 text-sm">
                {chauffeur.telephone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    <span>{chauffeur.telephone}</span>
                  </div>
                )}
                {chauffeur.numero_permis && (
                  <div className="flex items-center gap-1.5">
                    <Award className="h-4 w-4" />
                    <span>{chauffeur.numero_permis}</span>
                  </div>
                )}
                {chauffeur.date_embauche && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Depuis {format(new Date(chauffeur.date_embauche), "MMM yyyy", { locale: fr })}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-4">
                <ChauffeurCreateTripButton chauffeurId={chauffeurId} />
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/chauffeurs/${chauffeurId}/modifier`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Stats - Desktop only */}
            {stats && !loadingStats && (
              <div className="hidden lg:flex flex-col gap-3">
                <QuickStatBadge
                  icon={Route}
                  value={stats.nb_trajets}
                  label="trajets"
                />
                <QuickStatBadge
                  icon={MapPin}
                  value={`${(stats.km_total / 1000).toFixed(0)}k`}
                  label="km"
                />
                <QuickStatBadge
                  icon={Package}
                  value={stats.nb_conteneurs}
                  label="conteneurs"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats - Mobile/Tablet */}
      {stats && !loadingStats && (
        <div className="grid grid-cols-3 gap-3 lg:hidden">
          <QuickStatCard
            icon={Route}
            value={stats.nb_trajets}
            label="Trajets"
          />
          <QuickStatCard
            icon={MapPin}
            value={`${(stats.km_total / 1000).toFixed(1)}k km`}
            label="Distance"
          />
          <QuickStatCard
            icon={Package}
            value={stats.nb_conteneurs}
            label="Conteneurs"
          />
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg",
                "text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 text-xs rounded-full",
                  isActive ? "bg-primary/10 text-primary" : "bg-muted-foreground/20"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* Informations Tab */}
        {activeTab === "informations" && (
          <div className="space-y-4 opacity-0 animate-fade-in">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informations personnelles
                </h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <InfoField label="Nom" value={chauffeur.nom} />
                  <InfoField label="Prénom" value={chauffeur.prenom} />
                  <InfoField
                    label="Téléphone"
                    value={chauffeur.telephone}
                    icon={Phone}
                  />
                  <InfoField
                    label="N° Permis"
                    value={chauffeur.numero_permis}
                    icon={Award}
                  />
                  <InfoField
                    label="Date d'embauche"
                    value={chauffeur.date_embauche
                      ? format(new Date(chauffeur.date_embauche), "dd MMMM yyyy", { locale: fr })
                      : null
                    }
                    icon={Calendar}
                  />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Statut</p>
                    <span className={cn(
                      "inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium",
                      statusConfig.bgLightClass,
                      statusConfig.textClass
                    )}>
                      <span className={cn("w-2 h-2 rounded-full mr-2", statusConfig.bgClass)} />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trajets Tab */}
        {activeTab === "trajets" && (
          <div className="space-y-4 opacity-0 animate-fade-in">
            {loadingTrajets ? (
              <TrajetsListSkeleton />
            ) : trajets.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="Aucun trajet"
                description="Ce chauffeur n'a pas encore effectué de trajets."
              />
            ) : (
              <div className="space-y-3">
                {(trajets as TrajetWithDetails[]).map((trajet, index) => (
                  <TrajetCard
                    key={trajet.id}
                    trajet={trajet}
                    index={index}
                  />
                ))}
                {trajetsCount > 10 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" asChild>
                      <Link href={`/trajets?chauffeurIds=${chauffeurId}`}>
                        Voir tous les trajets ({trajetsCount})
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Statistiques Tab */}
        {activeTab === "statistiques" && (
          <div className="space-y-4 opacity-0 animate-fade-in">
            {loadingStats ? (
              <StatsSkeleton />
            ) : !stats ? (
              <EmptyState
                icon={TrendingUp}
                title="Pas de statistiques"
                description="Les statistiques seront disponibles après les premiers trajets."
              />
            ) : (
              <>
                {/* KPI Grid */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    icon={Route}
                    label="Trajets effectués"
                    value={stats.nb_trajets.toString()}
                    color="blue"
                  />
                  <StatCard
                    icon={MapPin}
                    label="Distance totale"
                    value={`${stats.km_total.toLocaleString("fr-FR")} km`}
                    color="emerald"
                  />
                  <StatCard
                    icon={Package}
                    label="Conteneurs"
                    value={stats.nb_conteneurs.toString()}
                    color="amber"
                  />
                  <StatCard
                    icon={Fuel}
                    label="Conso. moyenne"
                    value={`${stats.conso_moyenne.toFixed(1)} L/100`}
                    color="rose"
                  />
                </div>

                {/* Cost Analysis */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Fuel className="h-5 w-5 text-primary" />
                      Analyse des coûts
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-muted-foreground">Coût carburant</span>
                        <span className="font-semibold tabular-nums">
                          {formatCurrency(stats.cout_carburant_total)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-muted-foreground">Frais annexes</span>
                        <span className="font-semibold tabular-nums">
                          {formatCurrency(stats.cout_frais_total)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-2">
                        <span className="font-semibold">Coût total</span>
                        <span className="text-xl font-bold text-primary tabular-nums">
                          {formatCurrency(stats.cout_carburant_total + stats.cout_frais_total)}
                        </span>
                      </div>
                      {stats.nb_trajets > 0 && (
                        <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Moyenne par trajet</span>
                          <span className="font-medium tabular-nums">
                            {formatCurrency((stats.cout_carburant_total + stats.cout_frais_total) / stats.nb_trajets)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components

function QuickStatBadge({ icon: Icon, value, label }: { icon: typeof Route; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
      <Icon className="h-4 w-4 text-white/70" />
      <span className="text-lg font-bold text-white tabular-nums">{value}</span>
      <span className="text-xs text-white/60">{label}</span>
    </div>
  );
}

function QuickStatCard({ icon: Icon, value, label }: { icon: typeof Route; value: string | number; label: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3 text-center">
        <Icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
        <p className="text-lg font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function InfoField({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: typeof Phone }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <p className="font-medium">{value || <span className="text-muted-foreground">—</span>}</p>
      </div>
    </div>
  );
}

function TrajetCard({ trajet, index }: { trajet: TrajetWithDetails; index: number }) {
  const statutConfig = {
    termine: { label: "Terminé", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
    en_cours: { label: "En cours", class: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
    annule: { label: "Annulé", class: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  };
  const config = statutConfig[trajet.statut as keyof typeof statutConfig] || statutConfig.en_cours;

  return (
    <Link
      href={`/trajets/${trajet.id}`}
      className="block opacity-0 animate-slide-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Route */}
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium truncate">
                  {trajet.localite_depart?.nom} → {trajet.localite_arrivee?.nom}
                </span>
              </div>
              {/* Details row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(trajet.date_trajet), "dd MMM yyyy", { locale: fr })}
                </span>
                {trajet.vehicule && (
                  <span className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" />
                    {trajet.vehicule.immatriculation}
                  </span>
                )}
                {trajet.parcours_total > 0 && (
                  <span className="flex items-center gap-1">
                    <Route className="h-3.5 w-3.5" />
                    {trajet.parcours_total} km
                  </span>
                )}
              </div>
            </div>
            {/* Status + Arrow */}
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn("px-2 py-1 rounded-md text-xs font-medium", config.class)}>
                {config.label}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof Route;
  label: string;
  value: string;
  color: "blue" | "emerald" | "amber" | "rose";
}) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400",
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", colors[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof Truck; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm text-center max-w-xs">{description}</p>
    </div>
  );
}

// Skeleton components
function ChauffeurDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-48 rounded-2xl bg-muted animate-pulse" />
      <div className="grid grid-cols-3 gap-3 lg:hidden">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
      <div className="h-12 rounded-xl bg-muted animate-pulse" />
      <div className="h-64 rounded-xl bg-muted animate-pulse" />
    </div>
  );
}

function TrajetsListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
      <div className="h-48 rounded-xl bg-muted animate-pulse" />
    </div>
  );
}
