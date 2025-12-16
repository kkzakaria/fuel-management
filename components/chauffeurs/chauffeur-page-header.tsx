/**
 * Chauffeur Page Header - Floating Command Bar
 *
 * Compact, sticky design with:
 * - Glassmorphism floating bar
 * - Inline mini stat badges
 * - Integrated search, filters, and actions
 * - Minimal height footprint
 * - Enhanced background on scroll
 */

"use client";

import { useState, useEffect } from "react";
import { Search, Users, Truck, Coffee, AlertTriangle, UserX, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ChauffeurStatusStats } from "@/lib/dashboard-types";

// Compact status configuration
const STATUS_CONFIG = {
  actif: {
    key: "actif",
    label: "Disponible",
    shortLabel: "Dispo",
    icon: Users,
    dotClass: "bg-emerald-500",
    activeClass: "bg-emerald-500 text-white shadow-emerald-500/25",
    inactiveClass: "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
  },
  en_voyage: {
    key: "en_voyage",
    label: "En voyage",
    shortLabel: "Voyage",
    icon: Truck,
    dotClass: "bg-blue-500",
    activeClass: "bg-blue-500 text-white shadow-blue-500/25",
    inactiveClass: "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50",
  },
  en_conge: {
    key: "en_conge",
    label: "En congé",
    shortLabel: "Congé",
    icon: Coffee,
    dotClass: "bg-amber-500",
    activeClass: "bg-amber-500 text-white shadow-amber-500/25",
    inactiveClass: "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50",
  },
  suspendu: {
    key: "suspendu",
    label: "Suspendu",
    shortLabel: "Susp.",
    icon: AlertTriangle,
    dotClass: "bg-red-500",
    activeClass: "bg-red-500 text-white shadow-red-500/25",
    inactiveClass: "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50",
  },
  inactif: {
    key: "inactif",
    label: "Inactif",
    shortLabel: "Inact.",
    icon: UserX,
    dotClass: "bg-slate-400",
    activeClass: "bg-slate-500 text-white shadow-slate-500/25",
    inactiveClass: "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50",
  },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

interface ChauffeurPageHeaderProps {
  statusStats: ChauffeurStatusStats[];
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

export function ChauffeurPageHeader({
  statusStats,
  totalCount,
  filteredCount,
  searchValue,
  onSearchChange,
  activeStatus,
  onStatusChange,
  onAddClick,
  canAdd = false,
  loading,
}: ChauffeurPageHeaderProps) {
  // Track scroll position for enhanced background
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Build counts map from stats
  const statusCounts: Record<string, number> = {};
  statusStats.forEach((stat) => {
    statusCounts[stat.statut] = stat.count;
  });

  const statuses = Object.values(STATUS_CONFIG);
  const hasActiveFilter = activeStatus !== null || searchValue.trim() !== "";

  return (
    <div className={cn(
      "sticky top-0 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8",
      "pt-3 pb-3",
      "backdrop-blur-xl",
      "border-b transition-all duration-300",
      // Background changes based on scroll
      isScrolled
        ? "bg-background/95 border-border shadow-md"
        : "bg-background/60 border-transparent shadow-none"
    )}>
      {/* Main command bar */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Title + Stats + Search + Add (Desktop) */}
        <div className="flex items-center gap-3">
          {/* Title & count - compact */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              "bg-gradient-to-br from-slate-800 to-slate-900",
              "dark:from-slate-700 dark:to-slate-800"
            )}>
              <Users className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-foreground leading-none">
                Chauffeurs
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {loading ? "..." : (
                  hasActiveFilter
                    ? `${filteredCount}/${totalCount}`
                    : `${totalCount} total`
                )}
              </p>
            </div>
          </div>

          {/* Mini stat badges - Desktop only */}
          <div className="hidden lg:flex items-center gap-1 ml-2">
            {statuses.map((status) => {
              const count = statusCounts[status.key] || 0;
              return (
                <div
                  key={status.key}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50"
                  title={status.label}
                >
                  <span className={cn("w-2 h-2 rounded-full", status.dotClass)} />
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
          <div className="relative w-full max-w-[200px] sm:max-w-[240px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher..."
              className={cn(
                "w-full h-8 pl-8 pr-8 text-sm rounded-lg",
                "bg-muted/50 border border-border/50",
                "placeholder:text-muted-foreground/60",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                "transition-all duration-200"
              )}
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Add button */}
          {canAdd && (
            <Button
              onClick={onAddClick}
              size="sm"
              className="h-8 gap-1.5 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nouveau</span>
            </Button>
          )}
        </div>

        {/* Row 2: Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 -mb-0.5 scrollbar-hide">
          {/* All filter */}
          <button
            onClick={() => onStatusChange(null)}
            className={cn(
              "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-medium shrink-0",
              "border transition-all duration-200",
              activeStatus === null
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-transparent text-muted-foreground border-border/60 hover:bg-muted/50 hover:border-border"
            )}
          >
            <span>Tous</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-semibold tabular-nums",
              activeStatus === null ? "bg-white/20" : "bg-muted"
            )}>
              {loading ? "-" : totalCount}
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-border/60 mx-0.5 shrink-0" />

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
                  "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-medium shrink-0",
                  "border border-transparent transition-all duration-200",
                  isActive
                    ? cn(status.activeClass, "shadow-sm")
                    : status.inactiveClass
                )}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{status.label}</span>
                <span className="sm:hidden">{status.shortLabel}</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-semibold tabular-nums",
                  isActive ? "bg-white/20" : "bg-current/10"
                )}>
                  {loading ? "-" : count}
                </span>
              </button>
            );
          })}

          {/* Clear filters button */}
          {hasActiveFilter && (
            <>
              <div className="w-px h-4 bg-border/60 mx-0.5 shrink-0" />
              <button
                onClick={() => {
                  onStatusChange(null);
                  onSearchChange("");
                }}
                className={cn(
                  "inline-flex items-center gap-1 h-7 px-2 rounded-full text-xs font-medium shrink-0",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  "transition-all duration-200"
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
