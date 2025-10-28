/**
 * Dashboard Queries
 *
 * Specialized queries for dashboard statistics and KPIs
 */

import { createClient } from "./server";
import type {
  DashboardStats,
  ContainerStats,
  VehicleConsumption,
  TripChartData,
  CostChartData,
} from "../dashboard-types";
import { formatDateForQuery } from "../date-utils";

// =============================================================================
// Dashboard Main Stats
// =============================================================================

export async function getDashboardStats(
  dateFrom: Date,
  dateTo: Date,
): Promise<DashboardStats> {
  const supabase = await createClient();

  // Get total containers by type
  const { data: containerData } = await supabase
    .from("conteneur_trajet")
    .select(
      `
      quantite,
      type_conteneur:type_conteneur(nom)
    `,
    )
    .gte(
      "trajet_id",
      supabase
        .from("trajet")
        .select("id")
        .gte("date_trajet", formatDateForQuery(dateFrom))
        .lte("date_trajet", formatDateForQuery(dateTo)),
    );

  // Count containers by type
  const containersByType = {
    type20: 0,
    type40: 0,
    type40HC: 0,
    type45HC: 0,
  };

  let totalContainers = 0;

  containerData?.forEach((item) => {
    const quantity = item.quantite || 0;
    totalContainers += quantity;

    // @ts-expect-error - type_conteneur is joined
    const typeName = item.type_conteneur?.nom || "";

    if (typeName.includes("20")) containersByType.type20 += quantity;
    else if (typeName.includes("45")) containersByType.type45HC += quantity;
    else if (typeName.includes("High Cube"))
      containersByType.type40HC += quantity;
    else if (typeName.includes("40")) containersByType.type40 += quantity;
  });

  // Get total trips and fuel data
  const { data: tripData } = await supabase
    .from("trajet")
    .select("*")
    .gte("date_trajet", formatDateForQuery(dateFrom))
    .lte("date_trajet", formatDateForQuery(dateTo));

  const totalTrips = tripData?.length || 0;

  // Calculate fuel stats
  let totalFuelCost = 0;
  let totalLiters = 0;
  let totalKm = 0;

  tripData?.forEach((trip) => {
    totalFuelCost += trip.montant_carburant || 0;
    totalLiters += trip.litrage_station || 0;
    totalKm += trip.parcours_total || 0;
  });

  const averageConsumption = totalKm > 0 ? (totalLiters / totalKm) * 100 : 0;

  // Get previous period data for comparison
  const periodDuration = dateTo.getTime() - dateFrom.getTime();
  const prevFrom = new Date(dateFrom.getTime() - periodDuration);
  const prevTo = new Date(dateFrom.getTime() - 1);

  const { data: prevTripData } = await supabase
    .from("trajet")
    .select("id, montant_carburant")
    .gte("date_trajet", formatDateForQuery(prevFrom))
    .lte("date_trajet", formatDateForQuery(prevTo));

  const prevTotalTrips = prevTripData?.length || 0;
  const prevTotalFuelCost =
    prevTripData?.reduce((sum, t) => sum + (t.montant_carburant || 0), 0) || 0;

  // Calculate changes
  const tripsChange =
    prevTotalTrips > 0
      ? ((totalTrips - prevTotalTrips) / prevTotalTrips) * 100
      : 0;
  const fuelCostChange =
    prevTotalFuelCost > 0
      ? ((totalFuelCost - prevTotalFuelCost) / prevTotalFuelCost) * 100
      : 0;

  // Determine consumption trend (simplified)
  let consumptionTrend: "up" | "down" | "stable" = "stable";
  if (averageConsumption > 12) consumptionTrend = "up";
  else if (averageConsumption < 10) consumptionTrend = "down";

  return {
    totalContainers,
    containersByType,
    totalTrips,
    tripsChange,
    totalFuelCost,
    fuelCostChange,
    averageConsumption,
    consumptionTrend,
    activeAlerts: 0, // Will be populated by alerts query
  };
}

// =============================================================================
// Container Statistics
// =============================================================================

export async function getContainerStats(
  dateFrom: Date,
  dateTo: Date,
): Promise<ContainerStats[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("conteneur_trajet")
    .select(
      `
      quantite,
      type_conteneur:type_conteneur(nom)
    `,
    )
    .gte(
      "trajet_id",
      supabase
        .from("trajet")
        .select("id")
        .gte("date_trajet", formatDateForQuery(dateFrom))
        .lte("date_trajet", formatDateForQuery(dateTo)),
    );

  // Aggregate by type
  const stats: Record<string, number> = {};
  let total = 0;

  data?.forEach((item) => {
    // @ts-expect-error - type_conteneur is joined
    const typeName = item.type_conteneur?.nom || "Inconnu";
    const quantity = item.quantite || 0;

    stats[typeName] = (stats[typeName] || 0) + quantity;
    total += quantity;
  });

  // Convert to array with percentages
  return Object.entries(stats).map(([type, count]) => ({
    type,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
    color: getContainerTypeColor(type),
  }));
}

// Helper function
function getContainerTypeColor(type: string): string {
  const colors: Record<string, string> = {
    "20 pieds standard": "hsl(var(--chart-1))",
    "40 pieds standard": "hsl(var(--chart-2))",
    "40 pieds High Cube": "hsl(var(--chart-3))",
    "45 pieds High Cube": "hsl(var(--chart-4))",
  };
  return colors[type] || "hsl(var(--chart-5))";
}

// =============================================================================
// Vehicle Consumption Stats
// =============================================================================

export async function getVehicleConsumptionStats(
  dateFrom: Date,
  dateTo: Date,
  limit: number = 10,
): Promise<VehicleConsumption[]> {
  const supabase = await createClient();

  const { data: tripData } = await supabase
    .from("trajet")
    .select(
      `
      vehicule_id,
      consommation_au_100,
      parcours_total,
      vehicule:vehicule(immatriculation, marque, modele)
    `,
    )
    .gte("date_trajet", formatDateForQuery(dateFrom))
    .lte("date_trajet", formatDateForQuery(dateTo))
    .not("consommation_au_100", "is", null)
    .not("parcours_total", "is", null);

  if (!tripData) return [];

  // Aggregate by vehicle
  const vehicleMap: Record<
    string,
    {
      vehicleId: string;
      immatriculation: string;
      marque: string;
      modele: string;
      totalConsumption: number;
      trips: number;
      totalKm: number;
    }
  > = {};

  tripData.forEach((trip) => {
    const vehicleId = trip.vehicule_id;
    if (!vehicleId) return;

    const vehicleInfo = Array.isArray(trip.vehicule) ? trip.vehicule[0] : trip.vehicule;

    if (!vehicleMap[vehicleId]) {
      vehicleMap[vehicleId] = {
        vehicleId,
        immatriculation: vehicleInfo?.immatriculation || "",
        marque: vehicleInfo?.marque || "",
        modele: vehicleInfo?.modele || "",
        totalConsumption: 0,
        trips: 0,
        totalKm: 0,
      };
    }

    vehicleMap[vehicleId].totalConsumption += trip.consommation_au_100 || 0;
    vehicleMap[vehicleId].trips += 1;
    vehicleMap[vehicleId].totalKm += trip.parcours_total || 0;
  });

  // Convert to array with average consumption
  const result = Object.values(vehicleMap)
    .map((v) => {
      const avgConsumption = v.trips > 0 ? v.totalConsumption / v.trips : 0;
      return {
        vehicleId: v.vehicleId,
        immatriculation: v.immatriculation,
        marque: v.marque,
        modele: v.modele,
        avgConsumption, // Required by VehicleConsumption type
        consumption: avgConsumption, // Optional, same value for compatibility
        trips: v.trips,
        totalKm: v.totalKm,
      };
    })
    .sort((a, b) => b.trips - a.trips)
    .slice(0, limit);

  return result;
}

// =============================================================================
// Trip Chart Data (Daily/Weekly aggregation)
// =============================================================================

export async function getTripChartData(
  dateFrom: Date,
  dateTo: Date,
): Promise<TripChartData[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("trajet")
    .select("date_trajet, id")
    .gte("date_trajet", formatDateForQuery(dateFrom))
    .lte("date_trajet", formatDateForQuery(dateTo))
    .order("date_trajet");

  if (!data) return [];

  // Group by date
  const dateMap: Record<string, number> = {};

  data.forEach((trip) => {
    const date = trip.date_trajet;
    dateMap[date] = (dateMap[date] || 0) + 1;
  });

  // Convert to array
  return Object.entries(dateMap).map(([date, trips]) => ({
    date,
    count: trips, // Required by TripChartData type
    trips, // Optional, same value for compatibility
    containers: 0, // Could be enhanced with container count
  }));
}

// =============================================================================
// Cost Chart Data (Monthly aggregation)
// =============================================================================

export async function getCostChartData(
  dateFrom: Date,
  dateTo: Date,
): Promise<CostChartData[]> {
  const supabase = await createClient();

  // Get trips with costs
  const { data: tripData } = await supabase
    .from("trajet")
    .select("date_trajet, prix_litre, litrage_station, frais_peage, autres_frais")
    .gte("date_trajet", formatDateForQuery(dateFrom))
    .lte("date_trajet", formatDateForQuery(dateTo));

  // Aggregate by date
  const dateMap: Record<string, number> = {};

  tripData?.forEach((trip) => {
    const date = trip.date_trajet;
    if (!dateMap[date]) {
      dateMap[date] = 0;
    }
    const fuelCost = (trip.prix_litre || 0) * (trip.litrage_station || 0);
    const totalCost = fuelCost + (trip.frais_peage || 0) + (trip.autres_frais || 0);
    dateMap[date] += totalCost;
  });

  // Convert to array matching CostChartData interface
  return Object.entries(dateMap)
    .map(([date, totalCost]) => ({
      date,
      totalCost,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
