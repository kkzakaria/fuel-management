/**
 * Format Utilities
 *
 * Helper functions for formatting numbers, currency, and units
 */

/**
 * Format number with French locale (space as thousands separator)
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format currency (CFA Franc)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF", // West African CFA franc
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format compact currency (K, M for thousands, millions)
 */
export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `${formatNumber(value / 1_000_000, 1)}M FCFA`;
  }
  if (value >= 1_000) {
    return `${formatNumber(value / 1_000, 1)}K FCFA`;
  }
  return `${formatNumber(value)} FCFA`;
}

/**
 * Format liters with unit
 */
export function formatLiters(value: number, decimals: number = 1): string {
  return `${formatNumber(value, decimals)} L`;
}

/**
 * Format consumption (L/100km)
 */
export function formatConsumption(value: number): string {
  return `${formatNumber(value, 2)} L/100km`;
}

/**
 * Format kilometers
 */
export function formatKilometers(value: number): string {
  return `${formatNumber(value)} km`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Format percentage change with sign
 */
export function formatPercentageChange(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatPercentage(value, 1)}`;
}

/**
 * Get trend indicator
 */
export function getTrendIndicator(value: number): {
  icon: "↗" | "↘" | "→";
  color: string;
  text: string;
} {
  if (value > 2) {
    return { icon: "↗", color: "text-green-600", text: "en hausse" };
  }
  if (value < -2) {
    return { icon: "↘", color: "text-red-600", text: "en baisse" };
  }
  return { icon: "→", color: "text-gray-600", text: "stable" };
}

/**
 * Format container type label
 */
export function formatContainerType(type: string): string {
  const labels: Record<string, string> = {
    "20 pieds standard": "20'",
    "40 pieds standard": "40'",
    "40 pieds High Cube": "40' HC",
    "45 pieds High Cube": "45' HC",
  };
  return labels[type] || type;
}

/**
 * Get container type color
 */
export function getContainerTypeColor(type: string): string {
  const colors: Record<string, string> = {
    "20 pieds standard": "hsl(var(--chart-1))",
    "40 pieds standard": "hsl(var(--chart-2))",
    "40 pieds High Cube": "hsl(var(--chart-3))",
    "45 pieds High Cube": "hsl(var(--chart-4))",
  };
  return colors[type] || "hsl(var(--chart-5))";
}

/**
 * Format relative time (Il y a X minutes/heures/jours)
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Get alert severity color
 */
export function getAlertSeverityColor(
  severity: "critical" | "warning" | "info",
): string {
  const colors = {
    critical: "destructive",
    warning: "default",
    info: "secondary",
  };
  return colors[severity];
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
