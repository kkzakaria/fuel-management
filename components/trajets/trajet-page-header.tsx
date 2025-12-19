/**
 * Trajet Page Header - Industrial Command Bar
 *
 * Bold, utilitarian design with:
 * - Floating glassmorphism bar
 * - Status chips with counts
 * - Integrated search and quick filters
 * - Warm amber accents for alerts
 */

"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Route,
  Play,
  CheckCircle2,
  XCircle,
  Plus,
  X,
  AlertTriangle,
  Fuel,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Trip status configuration with industrial colors
const STATUS_CONFIG = {
  en_cours: {
    key: "en_cours",
    label: "En cours",
    shortLabel: "Actifs",
    icon: Play,
    dotClass: "bg-amber-500",
    activeClass: "bg-amber-500 text-white shadow-amber-500/25",
    inactiveClass:
      "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50",
  },
  termine: {
    key: "termine",
    label: "Terminés",
    shortLabel: "Finis",
    icon: CheckCircle2,
    dotClass: "bg-emerald-500",
    activeClass: "bg-emerald-500 text-white shadow-emerald-500/25",
    inactiveClass:
      "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
  },
  annule: {
    key: "annule",
    label: "Annulés",
    shortLabel: "Annul.",
    icon: XCircle,
    dotClass: "bg-slate-400",
    activeClass: "bg-slate-500 text-white shadow-slate-500/25",
    inactiveClass:
      "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50",
  },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

export interface TrajetStatusStats {
  en_cours: number;
  termine: number;
  annule: number;
  with_alerts: number;
}

interface TrajetPageHeaderProps {
  stats: TrajetStatusStats;
  totalCount: number;
  filteredCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeStatus: StatusKey | null;
  onStatusChange: (status: StatusKey | null) => void;
  onAddClick?: () => void;
  canAdd?: boolean;
  loading?: boolean;
}

export function TrajetPageHeader({
  stats,
  totalCount,
  filteredCount,
  searchValue,
  onSearchChange,
  activeStatus,
  onStatusChange,
  onAddClick,
  canAdd = false,
  loading,
}: TrajetPageHeaderProps) {
  // Track scroll for enhanced background
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const statuses = Object.values(STATUS_CONFIG);
  const hasActiveFilter = activeStatus !== null || searchValue.trim() !== "";

  return (
    <div
      className={cn(
        "sticky top-0 z-40 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
        "pb-3 pt-3",
        "backdrop-blur-xl",
        "border-b transition-all duration-300",
        isScrolled
          ? "border-border bg-background/95 shadow-md"
          : "border-transparent bg-background/60 shadow-none"
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Row 1: Title + Stats + Search + Add */}
        <div className="flex items-center gap-3">
          {/* Icon + Title */}
          <div className="flex shrink-0 items-center gap-2">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                "bg-gradient-to-br from-amber-500 to-orange-600",
                "shadow-lg shadow-amber-500/20"
              )}
            >
              <Route className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-none text-foreground">
                Trajets
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {loading
                  ? "..."
                  : hasActiveFilter
                    ? `${filteredCount}/${totalCount}`
                    : `${totalCount} total`}
              </p>
            </div>
          </div>

          {/* Quick stats - Desktop only */}
          <div className="ml-2 hidden items-center gap-2 lg:flex">
            {/* Alert indicator */}
            {stats.with_alerts > 0 && (
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2 py-1",
                  "bg-red-50 dark:bg-red-950/30"
                )}
                title="Trajets avec alertes carburant"
              >
                <Fuel className="h-3.5 w-3.5 text-red-500" />
                <span className="text-xs font-semibold tabular-nums text-red-600 dark:text-red-400">
                  {stats.with_alerts}
                </span>
              </div>
            )}

            {/* Status counts */}
            {statuses.map((status) => {
              const count = stats[status.key as StatusKey] || 0;
              return (
                <div
                  key={status.key}
                  className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1"
                  title={status.label}
                >
                  <span
                    className={cn("h-2 w-2 rounded-full", status.dotClass)}
                  />
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                    {loading ? "-" : count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search bar */}
          <div className="relative w-full max-w-[180px] sm:max-w-[220px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="N° trajet, ville..."
              className={cn(
                "h-8 w-full rounded-lg pl-8 pr-8 text-sm",
                "border border-border/50 bg-muted/50",
                "placeholder:text-muted-foreground/60",
                "transition-all duration-200",
                "focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              )}
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-muted"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Add button */}
          {canAdd && (
            <Button onClick={onAddClick} size="sm" className="h-8 shrink-0 gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nouveau</span>
            </Button>
          )}
        </div>

        {/* Row 2: Filter chips */}
        <div className="-mb-0.5 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {/* All filter */}
          <button
            onClick={() => onStatusChange(null)}
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium",
              "border transition-all duration-200",
              activeStatus === null
                ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                : "border-border/60 bg-transparent text-muted-foreground hover:border-border hover:bg-muted/50"
            )}
          >
            <span>Tous</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                activeStatus === null ? "bg-white/20" : "bg-muted"
              )}
            >
              {loading ? "-" : totalCount}
            </span>
          </button>

          {/* Divider */}
          <div className="mx-0.5 h-4 w-px shrink-0 bg-border/60" />

          {/* Status filters */}
          {statuses.map((status) => {
            const Icon = status.icon;
            const count = stats[status.key as StatusKey] || 0;
            const isActive = activeStatus === status.key;

            return (
              <button
                key={status.key}
                onClick={() => onStatusChange(isActive ? null : status.key)}
                className={cn(
                  "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium",
                  "border border-transparent transition-all duration-200",
                  isActive
                    ? cn(status.activeClass, "shadow-sm")
                    : status.inactiveClass
                )}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{status.label}</span>
                <span className="sm:hidden">{status.shortLabel}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                    isActive ? "bg-white/20" : "bg-current/10"
                  )}
                >
                  {loading ? "-" : count}
                </span>
              </button>
            );
          })}

          {/* Alerts filter */}
          {stats.with_alerts > 0 && (
            <>
              <div className="mx-0.5 h-4 w-px shrink-0 bg-border/60" />
              <button
                className={cn(
                  "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium",
                  "border border-transparent transition-all duration-200",
                  "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                )}
              >
                <AlertTriangle className="h-3 w-3" />
                <span className="hidden sm:inline">Alertes</span>
                <span
                  className={cn(
                    "rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-red-700",
                    "dark:bg-red-900/50 dark:text-red-300"
                  )}
                >
                  {stats.with_alerts}
                </span>
              </button>
            </>
          )}

          {/* Clear filters */}
          {hasActiveFilter && (
            <>
              <div className="mx-0.5 h-4 w-px shrink-0 bg-border/60" />
              <button
                onClick={() => {
                  onStatusChange(null);
                  onSearchChange("");
                }}
                className={cn(
                  "inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-medium",
                  "text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <X className="h-3 w-3" />
                <span className="hidden sm:inline">Effacer</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
