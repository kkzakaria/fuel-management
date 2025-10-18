/**
 * Dashboard Types
 *
 * Type definitions for dashboard KPIs, statistics, and alerts
 */

// =============================================================================
// KPI Types
// =============================================================================

export interface DashboardStats {
  totalContainers: number;
  containersByType: {
    type20: number;
    type40: number;
    type40HC: number;
    type45HC: number;
  };
  totalTrips: number;
  tripsChange: number; // Percentage change vs previous period
  totalFuelCost: number;
  fuelCostChange: number;
  averageConsumption: number; // L/100km
  consumptionTrend: "up" | "down" | "stable";
  activeAlerts: number;
}

export interface ContainerStats {
  type: string;
  count: number;
  percentage: number;
  color: string;
  [key: string]: string | number; // Index signature for chart compatibility
}

export interface FuelStats {
  averageConsumption: number;
  totalLiters: number;
  totalCost: number;
  averagePricePerLiter: number;
  trend: "up" | "down" | "stable";
}

export interface VehicleConsumption {
  vehicleId: string;
  immatriculation: string;
  marque: string;
  modele: string;
  avgConsumption: number; // L/100km for chart compatibility
  consumption?: number; // L/100km
  trips: number;
  totalKm: number;
}

// =============================================================================
// Chart Data Types
// =============================================================================

export interface TripChartData {
  date: string;
  count: number; // For chart compatibility
  trips?: number;
  containers?: number;
}

export interface CostChartData {
  date: string;
  totalCost: number; // For chart compatibility
  fuel?: number;
  fees?: number;
  subcontracting?: number;
}

// =============================================================================
// Alert Types
// =============================================================================

export type AlertSeverity = "critical" | "warning" | "info";

export type AlertType = "fuel_variance" | "abnormal_consumption" | "pending_payment";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  date: string;
  metadata?: {
    ecart_litrage?: number;
    consommation_au_100?: number;
    reste_10_pourcent?: number;
    [key: string]: unknown;
  };
}

export interface FuelVarianceAlert extends Alert {
  type: "fuel_variance";
  data: {
    tripId: string;
    chauffeur: string;
    vehicule: string;
    expectedLiters: number;
    actualLiters: number;
    variance: number;
  };
}

export interface AbnormalConsumptionAlert extends Alert {
  type: "abnormal_consumption";
  data: {
    tripId: string;
    vehicule: string;
    consumption: number;
    averageConsumption: number;
    percentageAbove: number;
  };
}

export interface PendingPaymentAlert extends Alert {
  type: "pending_payment";
  data: {
    missionId: string;
    sousTraitant: string;
    remainingAmount: number;
    daysOverdue: number;
  };
}

// =============================================================================
// Period Types
// =============================================================================

export type PeriodPreset = "today" | "week" | "month" | "quarter";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface Period {
  preset?: PeriodPreset;
  custom?: DateRange;
}
