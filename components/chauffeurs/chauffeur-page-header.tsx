/**
 * Chauffeur Page Header
 *
 * "Fleet Command Center" design with:
 * - Stats overview banner
 * - Visual status filter chips
 * - Search integrated
 */

"use client";

import { useMemo } from "react";
import { Search, Users, Truck, Coffee, AlertTriangle, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chauffeur } from "@/lib/supabase/types";

// Status configuration with colors and icons
const STATUS_CONFIG = {
  actif: {
    key: "actif",
    label: "Disponible",
    icon: Users,
    color: "emerald",
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    chipBg: "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50",
    chipBgActive: "bg-emerald-500 text-white hover:bg-emerald-600",
    borderClass: "border-emerald-200 dark:border-emerald-800",
  },
  en_voyage: {
    key: "en_voyage",
    label: "En voyage",
    icon: Truck,
    color: "blue",
    bgClass: "bg-blue-500",
    textClass: "text-blue-600 dark:text-blue-400",
    chipBg: "bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50",
    chipBgActive: "bg-blue-500 text-white hover:bg-blue-600",
    borderClass: "border-blue-200 dark:border-blue-800",
  },
  en_conge: {
    key: "en_conge",
    label: "En congé",
    icon: Coffee,
    color: "amber",
    bgClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    chipBg: "bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50",
    chipBgActive: "bg-amber-500 text-white hover:bg-amber-600",
    borderClass: "border-amber-200 dark:border-amber-800",
  },
  suspendu: {
    key: "suspendu",
    label: "Suspendu",
    icon: AlertTriangle,
    color: "red",
    bgClass: "bg-red-500",
    textClass: "text-red-600 dark:text-red-400",
    chipBg: "bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50",
    chipBgActive: "bg-red-500 text-white hover:bg-red-600",
    borderClass: "border-red-200 dark:border-red-800",
  },
  inactif: {
    key: "inactif",
    label: "Inactif",
    icon: UserX,
    color: "slate",
    bgClass: "bg-slate-400",
    textClass: "text-slate-600 dark:text-slate-400",
    chipBg: "bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-700/50",
    chipBgActive: "bg-slate-500 text-white hover:bg-slate-600",
    borderClass: "border-slate-200 dark:border-slate-700",
  },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

interface ChauffeurPageHeaderProps {
  chauffeurs: Chauffeur[];
  totalCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeStatus: StatusKey | null;
  onStatusChange: (status: StatusKey | null) => void;
  loading?: boolean;
}

export function ChauffeurPageHeader({
  chauffeurs,
  totalCount,
  searchValue,
  onSearchChange,
  activeStatus,
  onStatusChange,
  loading,
}: ChauffeurPageHeaderProps) {
  // Calculate status counts from chauffeurs data
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      actif: 0,
      en_voyage: 0,
      en_conge: 0,
      suspendu: 0,
      inactif: 0,
    };

    chauffeurs.forEach((c) => {
      const statut = c.statut as string;
      if (statut && statut in counts) {
        counts[statut] = (counts[statut] || 0) + 1;
      }
    });

    return counts;
  }, [chauffeurs]);

  const statuses = Object.values(STATUS_CONFIG);

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
        "dark:from-slate-800 dark:via-slate-900 dark:to-slate-950"
      )}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative px-5 py-6 sm:px-6 sm:py-8">
          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Équipe Chauffeurs
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {loading ? (
                  <span className="inline-block w-32 h-4 bg-slate-700 rounded animate-pulse" />
                ) : (
                  <>{totalCount} chauffeurs dans votre flotte</>
                )}
              </p>
            </div>

            {/* Search bar - integrated in header */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher..."
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 rounded-xl",
                  "bg-white/10 backdrop-blur-sm border border-white/10",
                  "text-white placeholder:text-slate-400",
                  "focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent",
                  "transition-all duration-200"
                )}
              />
            </div>
          </div>

          {/* Status stats row - Desktop */}
          <div className="hidden sm:grid grid-cols-5 gap-3">
            {statuses.map((status) => {
              const Icon = status.icon;
              const count = statusCounts[status.key] || 0;

              return (
                <div
                  key={status.key}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    status.bgClass
                  )}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tabular-nums">
                      {loading ? "-" : count}
                    </p>
                    <p className="text-xs text-slate-400">{status.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status stats row - Mobile (scrollable) */}
          <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {statuses.map((status) => {
              const Icon = status.icon;
              const count = statusCounts[status.key] || 0;

              return (
                <div
                  key={status.key}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm shrink-0"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center",
                    status.bgClass
                  )}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white tabular-nums leading-none">
                      {loading ? "-" : count}
                    </p>
                    <p className="text-[10px] text-slate-400">{status.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {/* All filter */}
        <button
          onClick={() => onStatusChange(null)}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
            "border transition-all duration-200",
            activeStatus === null
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
          )}
        >
          <Users className="h-4 w-4" />
          Tous
          <span className={cn(
            "px-1.5 py-0.5 rounded-full text-xs",
            activeStatus === null ? "bg-white/20" : "bg-muted-foreground/20"
          )}>
            {loading ? "-" : totalCount}
          </span>
        </button>

        {/* Status filters */}
        {statuses.map((status) => {
          const Icon = status.icon;
          const count = statusCounts[status.key] || 0;
          const isActive = activeStatus === status.key;

          return (
            <button
              key={status.key}
              onClick={() => onStatusChange(isActive ? null : status.key)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                "border transition-all duration-200",
                isActive
                  ? status.chipBgActive + " border-transparent"
                  : status.chipBg + " " + status.borderClass + " " + status.textClass
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{status.label}</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-xs",
                isActive ? "bg-white/20" : "bg-current/10"
              )}>
                {loading ? "-" : count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
