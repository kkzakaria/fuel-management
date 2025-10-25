/**
 * Report Types
 *
 * Type definitions for reports, filters, and export data
 */

// =============================================================================
// Report Types
// =============================================================================

export type ReportType =
  | "monthly" // Rapport mensuel complet
  | "driver" // Rapport par chauffeur
  | "vehicle" // Rapport par véhicule
  | "destination" // Rapport par destination
  | "financial"; // Rapport financier

export type ExportFormat = "pdf" | "excel";

// =============================================================================
// Report Filters
// =============================================================================

export interface ReportFilters {
  reportType: ReportType;
  dateFrom: Date;
  dateTo: Date;
  chauffeurId?: string;
  vehiculeId?: string;
  destinationId?: string;
  includeGraphs?: boolean;
  includeTables?: boolean;
}

// =============================================================================
// Report Data Structures
// =============================================================================

/**
 * Résumé exécutif (Executive Summary)
 */
export interface ExecutiveSummary {
  period: {
    from: Date;
    to: Date;
    label: string;
  };
  kpis: {
    totalTrips: number;
    tripsChange: number;
    totalContainers: number;
    containersChange: number;
    totalFuelCost: number;
    fuelCostChange: number;
    totalOtherCosts: number;
    totalCost: number;
    costChange: number;
    averageConsumption: number;
    consumptionTrend: "up" | "down" | "stable";
    activeAlerts: number;
  };
  highlights: string[]; // Key insights
}

/**
 * Performance flotte (Fleet Performance)
 */
export interface FleetPerformance {
  topDrivers: DriverPerformance[];
  topVehicles: VehiclePerformance[];
  bottomDrivers: DriverPerformance[];
  bottomVehicles: VehiclePerformance[];
  averageMetrics: {
    tripsPerDriver: number;
    containersPerDriver: number;
    consumptionPerVehicle: number;
    costPerTrip: number;
  };
}

export interface DriverPerformance {
  id: string;
  nom: string;
  prenom: string;
  totalTrips: number;
  totalContainers: number;
  totalKm: number;
  averageConsumption: number;
  totalCost: number;
  efficiency: number; // Score 0-100
}

export interface VehiclePerformance {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  totalTrips: number;
  totalKm: number;
  averageConsumption: number;
  totalFuelCost: number;
  maintenanceAlerts: number;
  efficiency: number; // Score 0-100
}

/**
 * Analyse financière (Financial Analysis)
 */
export interface FinancialAnalysis {
  totalCosts: {
    fuel: number;
    tolls: number;
    other: number;
    subcontracting: number;
    total: number;
  };
  costsByCategory: CostCategory[];
  costsByMonth: MonthlyCost[];
  costsByDestination: DestinationCost[];
  averages: {
    fuelPricePerLiter: number;
    costPerKm: number;
    costPerTrip: number;
    costPerContainer: number;
  };
  trends: {
    fuelCostTrend: "up" | "down" | "stable";
    totalCostTrend: "up" | "down" | "stable";
  };
}

export interface CostCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyCost {
  month: string;
  fuel: number;
  tolls: number;
  other: number;
  subcontracting: number;
  total: number;
}

export interface DestinationCost {
  destination: string;
  trips: number;
  totalCost: number;
  averageCost: number;
  containers: number;
}

/**
 * Detailed Trips (for tables)
 */
export interface ReportTrip {
  id: string;
  date: Date;
  chauffeur: string;
  vehicule: string;
  depart: string;
  destination: string;
  km: number;
  containers: number;
  fuelLiters: number;
  consumption: number;
  fuelCost: number;
  totalCost: number;
  status: string;
  alerts?: string[];
}

// =============================================================================
// Complete Report Data
// =============================================================================

/**
 * Rapport mensuel complet
 */
export interface MonthlyReport {
  type: "monthly";
  filters: ReportFilters;
  executiveSummary: ExecutiveSummary;
  fleetPerformance: FleetPerformance;
  financialAnalysis: FinancialAnalysis;
  detailedTrips?: ReportTrip[];
  generatedAt: Date;
}

/**
 * Rapport par chauffeur
 */
export interface DriverReport {
  type: "driver";
  filters: ReportFilters;
  driver: {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    dateEmbauche: Date;
  };
  performance: DriverPerformance;
  trips: ReportTrip[];
  statistics: {
    totalTrips: number;
    totalKm: number;
    totalContainers: number;
    averageConsumption: number;
    totalCost: number;
    tripsWithAlerts: number;
  };
  comparison: {
    vsAverageConsumption: number; // Percentage
    vsAverageCost: number; // Percentage
    ranking: number; // Position in fleet
    totalDrivers: number;
  };
  generatedAt: Date;
}

/**
 * Rapport par véhicule
 */
export interface VehicleReport {
  type: "vehicle";
  filters: ReportFilters;
  vehicle: {
    id: string;
    immatriculation: string;
    marque: string;
    modele: string;
    annee: number;
    typeCarburant: string;
    kilometrage: number;
  };
  performance: VehiclePerformance;
  trips: ReportTrip[];
  statistics: {
    totalTrips: number;
    totalKm: number;
    averageConsumption: number;
    totalFuelCost: number;
    totalMaintenanceCost: number;
  };
  comparison: {
    vsAverageConsumption: number; // Percentage
    vsAverageCost: number; // Percentage
    ranking: number; // Position in fleet
    totalVehicles: number;
  };
  alerts: {
    maintenanceNeeded: boolean;
    abnormalConsumption: boolean;
    highMileage: boolean;
  };
  generatedAt: Date;
}

/**
 * Rapport par destination
 */
export interface DestinationReport {
  type: "destination";
  filters: ReportFilters;
  destination: {
    id: string;
    nom: string;
    region: string;
  };
  statistics: {
    totalTrips: number;
    totalContainers: number;
    totalKm: number;
    averageCost: number;
    totalCost: number;
  };
  trips: ReportTrip[];
  trends: {
    tripsPerMonth: { month: string; count: number }[];
    costsPerMonth: { month: string; cost: number }[];
  };
  topDrivers: { nom: string; prenom: string; trips: number }[];
  topVehicles: { immatriculation: string; trips: number }[];
  generatedAt: Date;
}

/**
 * Rapport financier
 */
export interface FinancialReport {
  type: "financial";
  filters: ReportFilters;
  financialAnalysis: FinancialAnalysis;
  detailedCosts: {
    trips: ReportTrip[];
    subcontractingMissions: {
      id: string;
      date: Date;
      sousTraitant: string;
      cost: number;
      paid90: boolean;
      paid10: boolean;
      remaining: number;
    }[];
  };
  projections?: {
    nextMonthEstimate: number;
    trend: "up" | "down" | "stable";
    recommendation: string;
  };
  generatedAt: Date;
}

/**
 * Union type pour tous les rapports
 */
export type Report =
  | MonthlyReport
  | DriverReport
  | VehicleReport
  | DestinationReport
  | FinancialReport;

// =============================================================================
// Export Metadata
// =============================================================================

export interface ExportMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string[];
  creator: string;
  createdAt: Date;
}

// =============================================================================
// Chart Data Types
// =============================================================================

export interface ReportChartData {
  trips: { month: string; count: number; containers: number }[];
  costs: { month: string; fuel: number; total: number }[];
  consumption: { vehicle: string; consumption: number }[];
  categories: { category: string; amount: number; percentage: number }[];
}

// =============================================================================
// Report Generation Status
// =============================================================================

export type ReportStatus = "idle" | "loading" | "generating" | "success" | "error";

export interface ReportGenerationState {
  status: ReportStatus;
  progress: number; // 0-100
  message?: string;
  error?: string;
}
