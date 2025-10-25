/**
 * Date Utilities
 *
 * Helper functions for date calculations and period management
 */

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  differenceInDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange, PeriodPreset } from "./dashboard-types";

/**
 * Get date range for a period preset
 */
export function getPresetDateRange(preset: PeriodPreset): DateRange {
  const now = new Date();

  switch (preset) {
    case "today":
      return {
        from: startOfDay(now),
        to: endOfDay(now),
      };

    case "week":
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };

    case "month":
      return {
        from: startOfMonth(now),
        to: endOfMonth(now),
      };

    case "quarter":
      return {
        from: startOfMonth(subMonths(now, 2)),
        to: endOfMonth(now),
      };

    default:
      return {
        from: startOfDay(now),
        to: endOfDay(now),
      };
  }
}

/**
 * Get previous period for comparison
 */
export function getPreviousPeriod(range: DateRange): DateRange {
  const duration = differenceInDays(range.to, range.from);

  return {
    from: new Date(range.from.getTime() - duration * 24 * 60 * 60 * 1000),
    to: new Date(range.from.getTime() - 24 * 60 * 60 * 1000),
  };
}

/**
 * Format date range for display
 */
export function formatDateRange(range: DateRange): string {
  const { from, to } = range;

  // Same day
  if (format(from, "yyyy-MM-dd") === format(to, "yyyy-MM-dd")) {
    return format(from, "d MMMM yyyy", { locale: fr });
  }

  // Same month
  if (
    format(from, "yyyy-MM") === format(to, "yyyy-MM") &&
    format(from, "yyyy") === format(to, "yyyy")
  ) {
    return `${format(from, "d", { locale: fr })} - ${format(to, "d MMMM yyyy", { locale: fr })}`;
  }

  // Same year
  if (format(from, "yyyy") === format(to, "yyyy")) {
    return `${format(from, "d MMM", { locale: fr })} - ${format(to, "d MMM yyyy", { locale: fr })}`;
  }

  // Different years
  return `${format(from, "d MMM yyyy", { locale: fr })} - ${format(to, "d MMM yyyy", { locale: fr })}`;
}

/**
 * Format date for SQL queries
 */
export function formatDateForQuery(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Get period label for presets
 */
export function getPeriodLabel(preset: PeriodPreset): string {
  const labels: Record<PeriodPreset, string> = {
    today: "Aujourd'hui",
    week: "Cette semaine",
    month: "Ce mois",
    quarter: "3 derniers mois",
  };

  return labels[preset];
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const now = new Date();
  return format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
}

/**
 * Get month labels for chart (last N months)
 */
export function getMonthLabels(count: number): string[] {
  const labels: string[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const month = subMonths(now, i);
    labels.push(format(month, "MMM yyyy", { locale: fr }));
  }

  return labels;
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(
  current: number,
  previous: number,
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format date for display (French locale)
 */
export function formatDate(date: Date): string {
  return format(date, 'd MMM yyyy', { locale: fr });
}

/**
 * Format date with time for display (French locale)
 */
export function formatDateTime(date: Date): string {
  return format(date, "d MMM yyyy 'à' HH:mm", { locale: fr });
}
