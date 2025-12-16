/**
 * Chauffeur Stats Cards Component
 *
 * Professional "Fleet Command Center" design displaying driver statistics
 * with hybrid responsive layout and staggered animations
 */

"use client";

import Link from "next/link";
import { Users, Truck, Coffee, AlertTriangle, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ChauffeurStatusStats } from "@/lib/dashboard-types";
import type { LucideIcon } from "lucide-react";

// Configuration des icônes et styles par statut
type StatusConfigItem = {
  icon: LucideIcon;
  bgClass: string;
  borderColor: string;
};

const STATUS_CONFIG = {
  actif: {
    icon: Users,
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "hsl(142, 76%, 36%)",
  },
  en_voyage: {
    icon: Truck,
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "hsl(221, 83%, 53%)",
  },
  en_conge: {
    icon: Coffee,
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "hsl(45, 93%, 47%)",
  },
  suspendu: {
    icon: AlertTriangle,
    bgClass: "bg-red-50 dark:bg-red-950/30",
    borderColor: "hsl(0, 84%, 60%)",
  },
  inactif: {
    icon: UserX,
    bgClass: "bg-slate-100 dark:bg-slate-800/50",
    borderColor: "hsl(215, 14%, 34%)",
  },
} as const satisfies Record<string, StatusConfigItem>;

// Default fallback config
const DEFAULT_CONFIG: StatusConfigItem = STATUS_CONFIG.inactif;

// Helper function to get config safely
function getStatusConfig(statut: string): StatusConfigItem {
  return (STATUS_CONFIG as Record<string, StatusConfigItem>)[statut] ?? DEFAULT_CONFIG;
}

interface ChauffeurStatsCardsProps {
  chauffeurStats: ChauffeurStatusStats[];
  totalChauffeurs: number;
  loading?: boolean;
}

// Skeleton pour l'état de chargement
function StatsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Desktop skeleton */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-muted animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
      {/* Mobile skeleton */}
      <div className="lg:hidden">
        <div className="h-48 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  );
}

// Mini-card de statut individuel (cliquable)
function StatusMiniCard({
  stat,
  index,
  isDesktop = false,
}: {
  stat: ChauffeurStatusStats;
  index: number;
  isDesktop?: boolean;
}) {
  const config = getStatusConfig(stat.statut);
  const Icon = config.icon;

  return (
    <Link
      href={`/chauffeurs?statut=${stat.statut}`}
      className={cn(
        "block relative overflow-hidden rounded-lg transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-md cursor-pointer",
        "opacity-0 animate-slide-in-up",
        isDesktop ? "p-4" : "p-3",
        config.bgClass
      )}
      style={{
        animationDelay: `${(index + 1) * 100}ms`,
        borderLeft: `4px solid ${config.borderColor}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={cn(
              "font-bold tabular-nums tracking-tight",
              isDesktop ? "text-2xl" : "text-xl"
            )}
            style={{ color: config.borderColor }}
          >
            {stat.count}
          </p>
          <p className="text-xs text-muted-foreground font-medium truncate">
            {stat.label}
          </p>
        </div>
        <Icon
          className={cn(
            "opacity-20",
            isDesktop ? "h-8 w-8" : "h-6 w-6"
          )}
          style={{ color: config.borderColor }}
        />
      </div>
      {isDesktop && (
        <p className="text-xs text-muted-foreground mt-2">
          {stat.percentage.toFixed(0)}% de l&apos;équipe
        </p>
      )}
    </Link>
  );
}

// Card principale avec total (Desktop) - cliquable vers liste complète
function TotalCard({
  totalChauffeurs,
}: {
  totalChauffeurs: number;
}) {
  return (
    <Link href="/chauffeurs" className="block opacity-0 animate-slide-in-up" style={{ animationDelay: "0ms" }}>
      <Card
        className={cn(
          "relative overflow-hidden border-0 h-full",
          "bg-gradient-to-br from-slate-900 to-slate-800",
          "dark:from-slate-800 dark:to-slate-900",
          "hover:from-slate-800 hover:to-slate-700",
          "dark:hover:from-slate-700 dark:hover:to-slate-800",
          "transition-all duration-300 cursor-pointer"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                Équipe
              </p>
              <p className="text-3xl font-bold text-white tabular-nums">
                {totalChauffeurs}
              </p>
              <p className="text-xs text-slate-400">chauffeurs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ChauffeurStatsCards({
  chauffeurStats,
  totalChauffeurs,
  loading,
}: ChauffeurStatsCardsProps) {
  if (loading) {
    return <StatsSkeleton />;
  }

  // Trier les statuts par count décroissant pour affichage optimal
  const sortedStats = [...chauffeurStats].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-4" role="status" aria-label="Statistiques chauffeurs">
      {/* Desktop: 5 cards individuelles */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-4">
        <TotalCard totalChauffeurs={totalChauffeurs} />
        {sortedStats.slice(0, 4).map((stat, index) => (
          <StatusMiniCard
            key={stat.statut}
            stat={stat}
            index={index}
            isDesktop
          />
        ))}
      </div>

      {/* Mobile: Card consolidée */}
      <Card
        className={cn(
          "lg:hidden relative overflow-hidden border-0",
          "bg-gradient-to-br from-slate-50 to-white",
          "dark:from-slate-900 dark:to-slate-950",
          "shadow-sm opacity-0 animate-slide-in-up"
        )}
        style={{ animationDelay: "0ms" }}
      >
        <CardContent className="p-5">
          {/* Header avec total - cliquable vers liste complète */}
          <Link
            href="/chauffeurs"
            className="flex items-center justify-between mb-5 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 group-hover:bg-slate-800 dark:group-hover:bg-slate-600 transition-colors">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Équipe Chauffeurs
                </p>
                <p className="text-4xl font-bold tabular-nums tracking-tight group-hover:text-primary transition-colors">
                  {totalChauffeurs}
                </p>
              </div>
            </div>
          </Link>

          {/* Grid des statuts */}
          <div className="grid grid-cols-2 gap-3">
            {sortedStats.slice(0, 4).map((stat, index) => (
              <StatusMiniCard key={stat.statut} stat={stat} index={index} />
            ))}
          </div>

          {/* Statuts supplémentaires si plus de 4 */}
          {sortedStats.length > 4 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex flex-wrap gap-2">
                {sortedStats.slice(4).map((stat) => {
                  const config = getStatusConfig(stat.statut);
                  return (
                    <Link
                      key={stat.statut}
                      href={`/chauffeurs?statut=${stat.statut}`}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: config.borderColor }}
                      />
                      {stat.label}: {stat.count}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
