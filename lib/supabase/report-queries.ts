/**
 * Report Queries (Server-side)
 *
 * Specialized queries for report data generation
 */

import { createClient } from "./server";
import type {
  ExecutiveSummary,
  FleetPerformance,
  FinancialAnalysis,
  ReportTrip,
  DriverPerformance,
  VehiclePerformance,
  CostCategory,
  MonthlyCost,
  DestinationCost,
} from "../report-types";
import { formatDateForQuery } from "../date-utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// =============================================================================
// Executive Summary
// =============================================================================

export async function getExecutiveSummary(
  dateFrom: Date,
  dateTo: Date,
): Promise<ExecutiveSummary> {
  const supabase = await createClient();

  // Get current period stats
  const { data: trips } = await supabase
    .from("trajet")
    .select(
      `
      id,
      date_trajet,
      parcours_total,
      litrage_station,
      consommation_au_100,
      montant_carburant,
      cout_total,
      ecart_litrage,
      conteneurs:conteneur_trajet(quantite)
    `,
    )
    .gte("date_trajet", formatDateForQuery(dateFrom))
    .lte("date_trajet", formatDateForQuery(dateTo));

  // Get previous period for comparison
  const previousDateFrom = new Date(
    dateFrom.getTime() -
      (dateTo.getTime() - dateFrom.getTime() + 86400000),
  );
  const previousDateTo = new Date(dateFrom.getTime() - 86400000);

  const { data: previousTrips } = await supabase
    .from("trajet")
    .select(
      `
      id,
      montant_carburant,
      cout_total,
      consommation_au_100,
      conteneurs:conteneur_trajet(quantite)
    `,
    )
    .gte("date_trajet", formatDateForQuery(previousDateFrom))
    .lte("date_trajet", formatDateForQuery(previousDateTo));

  // Get active alerts
  const { count: alertsCount } = await supabase
    .from("trajet")
    .select("id", { count: "exact", head: true })
    .gte("date_trajet", formatDateForQuery(dateFrom))
    .lte("date_trajet", formatDateForQuery(dateTo))
    .or("ecart_litrage.gt.10,consommation_au_100.gt.50");

  // Calculate current period metrics
  const totalTrips = trips?.length || 0;
  const totalContainers =
    trips?.reduce(
      (sum, t) =>
        sum +
        ((t.conteneurs as unknown as { quantite: number }[])?.reduce(
          (s, c) => s + (c.quantite || 0),
          0,
        ) || 0),
      0,
    ) || 0;

  const totalFuelCost =
    trips?.reduce((sum, t) => sum + (t.montant_carburant || 0), 0) || 0;
  const totalOtherCosts =
    trips?.reduce((sum, t) => sum + ((t.cout_total || 0) - (t.montant_carburant || 0)), 0) || 0;
  const totalCost = trips?.reduce((sum, t) => sum + (t.cout_total || 0), 0) || 0;

  const averageConsumption =
    trips && trips.length > 0
      ? trips.reduce((sum, t) => sum + (t.consommation_au_100 || 0), 0) /
        trips.length
      : 0;

  // Calculate previous period metrics
  const prevTotalTrips = previousTrips?.length || 0;
  const prevTotalContainers =
    previousTrips?.reduce(
      (sum, t) =>
        sum +
        ((t.conteneurs as unknown as { quantite: number }[])?.reduce(
          (s, c) => s + (c.quantite || 0),
          0,
        ) || 0),
      0,
    ) || 0;

  const prevTotalFuelCost =
    previousTrips?.reduce((sum, t) => sum + (t.montant_carburant || 0), 0) ||
    0;
  const prevTotalCost =
    previousTrips?.reduce((sum, t) => sum + (t.cout_total || 0), 0) || 0;

  const prevAverageConsumption =
    previousTrips && previousTrips.length > 0
      ? previousTrips.reduce(
          (sum, t) => sum + (t.consommation_au_100 || 0),
          0,
        ) / previousTrips.length
      : 0;

  // Calculate percentage changes
  const tripsChange =
    prevTotalTrips > 0
      ? ((totalTrips - prevTotalTrips) / prevTotalTrips) * 100
      : 0;
  const containersChange =
    prevTotalContainers > 0
      ? ((totalContainers - prevTotalContainers) / prevTotalContainers) * 100
      : 0;
  const fuelCostChange =
    prevTotalFuelCost > 0
      ? ((totalFuelCost - prevTotalFuelCost) / prevTotalFuelCost) * 100
      : 0;
  const costChange =
    prevTotalCost > 0 ? ((totalCost - prevTotalCost) / prevTotalCost) * 100 : 0;

  // Determine consumption trend
  let consumptionTrend: "up" | "down" | "stable" = "stable";
  if (prevAverageConsumption > 0) {
    const consumptionDiff = averageConsumption - prevAverageConsumption;
    const consumptionPercent =
      (consumptionDiff / prevAverageConsumption) * 100;
    if (consumptionPercent > 5) consumptionTrend = "up";
    else if (consumptionPercent < -5) consumptionTrend = "down";
  }

  // Generate highlights
  const highlights: string[] = [];
  if (Math.abs(tripsChange) > 10) {
    highlights.push(
      `Trajets ${tripsChange > 0 ? "en hausse" : "en baisse"} de ${Math.abs(tripsChange).toFixed(1)}%`,
    );
  }
  if (Math.abs(fuelCostChange) > 15) {
    highlights.push(
      `Coût carburant ${fuelCostChange > 0 ? "en hausse" : "en baisse"} de ${Math.abs(fuelCostChange).toFixed(1)}%`,
    );
  }
  if (alertsCount && alertsCount > 5) {
    highlights.push(`${alertsCount} alertes actives nécessitent attention`);
  }
  if (consumptionTrend === "up") {
    highlights.push("Consommation moyenne en hausse - analyse recommandée");
  } else if (consumptionTrend === "down") {
    highlights.push("Amélioration de la consommation moyenne");
  }

  return {
    period: {
      from: dateFrom,
      to: dateTo,
      label: `${format(dateFrom, "d MMM", { locale: fr })} - ${format(dateTo, "d MMM yyyy", { locale: fr })}`,
    },
    kpis: {
      totalTrips,
      tripsChange,
      totalContainers,
      containersChange,
      totalFuelCost,
      fuelCostChange,
      totalOtherCosts,
      totalCost,
      costChange,
      averageConsumption,
      consumptionTrend,
      activeAlerts: alertsCount || 0,
    },
    highlights,
  };
}

// =============================================================================
// Fleet Performance
// =============================================================================

export async function getFleetPerformance(
  dateFrom: Date,
  dateTo: Date,
): Promise<FleetPerformance> {
  const supabase = await createClient();

  // Get driver performance
  const { data: driverTrips } = await supabase
    .from("trajet")
    .select(
      `
      chauffeur_id,
      parcours_total,
      litrage_station,
      consommation_au_100,
      cout_total,
      conteneurs:conteneur_trajet(quantite),
      chauffeur:chauffeur(nom, prenom)
    `,
    )
    .gte("date_trajet", formatDateForQuery(dateFrom))
    .lte("date_trajet", formatDateForQuery(dateTo))
    .not("chauffeur_id", "is", null);

  // Aggregate by driver
  const driverMap = new Map<string, DriverPerformance>();
  driverTrips?.forEach((trip) => {
    const driverId = trip.chauffeur_id as string;
    const driver = trip.chauffeur as unknown as { nom: string; prenom: string };

    if (!driverMap.has(driverId)) {
      driverMap.set(driverId, {
        id: driverId,
        nom: driver?.nom || "",
        prenom: driver?.prenom || "",
        totalTrips: 0,
        totalContainers: 0,
        totalKm: 0,
        averageConsumption: 0,
        totalCost: 0,
        efficiency: 0,
      });
    }

    const driverPerf = driverMap.get(driverId)!;
    driverPerf.totalTrips++;
    driverPerf.totalKm += trip.parcours_total || 0;
    driverPerf.totalCost += trip.cout_total || 0;

    const containers = (trip.conteneurs as unknown as { quantite: number }[]) || [];
    driverPerf.totalContainers += containers.reduce(
      (sum, c) => sum + (c.quantite || 0),
      0,
    );
  });

  // Calculate averages and efficiency
  const drivers = Array.from(driverMap.values()).map((driver) => {
    // Get trips for this driver to calculate average consumption
    const driverTripData = driverTrips?.filter(
      (t) => t.chauffeur_id === driver.id,
    );
    const avgConsumption =
      driverTripData && driverTripData.length > 0
        ? driverTripData.reduce(
            (sum, t) => sum + (t.consommation_au_100 || 0),
            0,
          ) / driverTripData.length
        : 0;

    driver.averageConsumption = avgConsumption;

    // Calculate efficiency score (0-100)
    // Based on: consumption (40%), cost per km (30%), trips count (30%)
    const costPerKm = driver.totalKm > 0 ? driver.totalCost / driver.totalKm : 0;
    const efficiencyScore =
      Math.max(0, 100 - avgConsumption * 2) * 0.4 + // Lower consumption = higher score
      Math.max(0, 100 - costPerKm * 5) * 0.3 + // Lower cost/km = higher score
      Math.min(100, driver.totalTrips * 5) * 0.3; // More trips = higher score

    driver.efficiency = Math.round(efficiencyScore);

    return driver;
  });

  // Sort by efficiency
  drivers.sort((a, b) => b.efficiency - a.efficiency);

  const topDrivers = drivers.slice(0, 5);
  const bottomDrivers = drivers.slice(-3).reverse();

  // Get vehicle performance
  const { data: vehicleTrips } = await supabase
    .from("trajet")
    .select(
      `
      vehicule_id,
      parcours_total,
      litrage_station,
      consommation_au_100,
      montant_carburant,
      ecart_litrage,
      vehicule:vehicule(immatriculation, marque, modele)
    `,
    )
    .gte("date_trajet", formatDateForQuery(dateFrom))
    .lte("date_trajet", formatDateForQuery(dateTo))
    .not("vehicule_id", "is", null);

  // Aggregate by vehicle
  const vehicleMap = new Map<string, VehiclePerformance>();
  vehicleTrips?.forEach((trip) => {
    const vehicleId = trip.vehicule_id as string;
    const vehicle = trip.vehicule as unknown as {
      immatriculation: string;
      marque: string;
      modele: string;
    };

    if (!vehicleMap.has(vehicleId)) {
      vehicleMap.set(vehicleId, {
        id: vehicleId,
        immatriculation: vehicle?.immatriculation || "",
        marque: vehicle?.marque || "",
        modele: vehicle?.modele || "",
        totalTrips: 0,
        totalKm: 0,
        averageConsumption: 0,
        totalFuelCost: 0,
        maintenanceAlerts: 0,
        efficiency: 0,
      });
    }

    const vehiclePerf = vehicleMap.get(vehicleId)!;
    vehiclePerf.totalTrips++;
    vehiclePerf.totalKm += trip.parcours_total || 0;
    vehiclePerf.totalFuelCost += trip.montant_carburant || 0;

    // Count maintenance alerts (abnormal consumption or high fuel variance)
    if (
      (trip.consommation_au_100 || 0) > 50 ||
      Math.abs(trip.ecart_litrage || 0) > 10
    ) {
      vehiclePerf.maintenanceAlerts++;
    }
  });

  // Calculate averages and efficiency
  const vehicles = Array.from(vehicleMap.values()).map((vehicle) => {
    // Get trips for this vehicle to calculate average consumption
    const vehicleTripData = vehicleTrips?.filter(
      (t) => t.vehicule_id === vehicle.id,
    );
    const avgConsumption =
      vehicleTripData && vehicleTripData.length > 0
        ? vehicleTripData.reduce(
            (sum, t) => sum + (t.consommation_au_100 || 0),
            0,
          ) / vehicleTripData.length
        : 0;

    vehicle.averageConsumption = avgConsumption;

    // Calculate efficiency score
    const fuelCostPerKm =
      vehicle.totalKm > 0 ? vehicle.totalFuelCost / vehicle.totalKm : 0;
    const alertPenalty = vehicle.maintenanceAlerts * 5;
    const efficiencyScore =
      Math.max(0, 100 - avgConsumption * 2) * 0.5 + // Consumption weight
      Math.max(0, 100 - fuelCostPerKm * 10) * 0.3 + // Cost weight
      Math.min(100, vehicle.totalTrips * 3) * 0.2 - // Usage weight
      alertPenalty; // Penalty for alerts

    vehicle.efficiency = Math.round(Math.max(0, efficiencyScore));

    return vehicle;
  });

  // Sort by efficiency
  vehicles.sort((a, b) => b.efficiency - a.efficiency);

  const topVehicles = vehicles.slice(0, 5);
  const bottomVehicles = vehicles.slice(-3).reverse();

  // Calculate average metrics
  const averageMetrics = {
    tripsPerDriver: drivers.length > 0
      ? drivers.reduce((sum, d) => sum + d.totalTrips, 0) / drivers.length
      : 0,
    containersPerDriver: drivers.length > 0
      ? drivers.reduce((sum, d) => sum + d.totalContainers, 0) / drivers.length
      : 0,
    consumptionPerVehicle: vehicles.length > 0
      ? vehicles.reduce((sum, v) => sum + v.averageConsumption, 0) /
        vehicles.length
      : 0,
    costPerTrip:
      (driverTrips?.length || 0) > 0
        ? (driverTrips?.reduce((sum, t) => sum + (t.cout_total || 0), 0) || 0) /
          (driverTrips?.length || 1)
        : 0,
  };

  return {
    topDrivers,
    topVehicles,
    bottomDrivers,
    bottomVehicles,
    averageMetrics,
  };
}

// =============================================================================
// Financial Analysis
// =============================================================================

export async function getFinancialAnalysis(
  dateFrom: Date,
  dateTo: Date,
): Promise<FinancialAnalysis> {
  const supabase = await createClient();

  // Get trip costs
  const { data: trips } = await supabase
    .from("trajet")
    .select(
      `
      id,
      date_trajet,
      montant_carburant,
      frais_peage,
      autres_frais,
      cout_total,
      parcours_total,
      litrage_station,
      prix_litre,
      destination:localite_destination_id(nom),
      conteneurs:conteneur_trajet(quantite)
    `,
    )
    .gte("date_trajet", formatDateForQuery(dateFrom))
    .lte("date_trajet", formatDateForQuery(dateTo));

  // Get subcontracting costs
  const { data: missions } = await supabase
    .from("mission_sous_traitance")
    .select("id, cout_transport, date_mission")
    .gte("date_mission", formatDateForQuery(dateFrom))
    .lte("date_mission", formatDateForQuery(dateTo));

  const totalFuel = trips?.reduce((sum, t) => sum + (t.montant_carburant || 0), 0) || 0;
  const totalTolls = trips?.reduce((sum, t) => sum + (t.frais_peage || 0), 0) || 0;
  const totalOther = trips?.reduce((sum, t) => sum + (t.autres_frais || 0), 0) || 0;
  const totalSubcontracting = missions?.reduce((sum, m) => sum + (m.cout_transport || 0), 0) || 0;
  const total = totalFuel + totalTolls + totalOther + totalSubcontracting;

  // Cost categories
  const costsByCategory: CostCategory[] = [
    {
      category: "Carburant",
      amount: totalFuel,
      percentage: total > 0 ? (totalFuel / total) * 100 : 0,
      color: "hsl(var(--chart-1))",
    },
    {
      category: "Péages",
      amount: totalTolls,
      percentage: total > 0 ? (totalTolls / total) * 100 : 0,
      color: "hsl(var(--chart-2))",
    },
    {
      category: "Autres frais",
      amount: totalOther,
      percentage: total > 0 ? (totalOther / total) * 100 : 0,
      color: "hsl(var(--chart-3))",
    },
    {
      category: "Sous-traitance",
      amount: totalSubcontracting,
      percentage: total > 0 ? (totalSubcontracting / total) * 100 : 0,
      color: "hsl(var(--chart-4))",
    },
  ];

  // Costs by month (aggregate by month)
  const monthsMap = new Map<string, MonthlyCost>();

  trips?.forEach((trip) => {
    const monthKey = format(new Date(trip.date_trajet), "MMM yyyy", {
      locale: fr,
    });
    if (!monthsMap.has(monthKey)) {
      monthsMap.set(monthKey, {
        month: monthKey,
        fuel: 0,
        tolls: 0,
        other: 0,
        subcontracting: 0,
        total: 0,
      });
    }
    const monthData = monthsMap.get(monthKey)!;
    monthData.fuel += trip.montant_carburant || 0;
    monthData.tolls += trip.frais_peage || 0;
    monthData.other += trip.autres_frais || 0;
    monthData.total +=
      (trip.montant_carburant || 0) +
      (trip.frais_peage || 0) +
      (trip.autres_frais || 0);
  });

  missions?.forEach((mission) => {
    const monthKey = format(new Date(mission.date_mission), "MMM yyyy", {
      locale: fr,
    });
    if (!monthsMap.has(monthKey)) {
      monthsMap.set(monthKey, {
        month: monthKey,
        fuel: 0,
        tolls: 0,
        other: 0,
        subcontracting: 0,
        total: 0,
      });
    }
    const monthData = monthsMap.get(monthKey)!;
    monthData.subcontracting += mission.cout_transport || 0;
    monthData.total += mission.cout_transport || 0;
  });

  const costsByMonth = Array.from(monthsMap.values());

  // Costs by destination
  const destinationMap = new Map<string, DestinationCost>();

  trips?.forEach((trip) => {
    const dest = trip.destination as unknown as { nom: string };
    const destName = dest?.nom || "Inconnu";

    if (!destinationMap.has(destName)) {
      destinationMap.set(destName, {
        destination: destName,
        trips: 0,
        totalCost: 0,
        averageCost: 0,
        containers: 0,
      });
    }

    const destData = destinationMap.get(destName)!;
    destData.trips++;
    destData.totalCost += trip.cout_total || 0;
    const containers = (trip.conteneurs as unknown as { quantite: number }[]) || [];
    destData.containers += containers.reduce(
      (sum, c) => sum + (c.quantite || 0),
      0,
    );
  });

  // Calculate averages
  destinationMap.forEach((dest) => {
    dest.averageCost = dest.trips > 0 ? dest.totalCost / dest.trips : 0;
  });

  const costsByDestination = Array.from(destinationMap.values())
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 10); // Top 10 destinations

  // Calculate averages
  const totalTrips = trips?.length || 0;
  const totalLiters = trips?.reduce((sum, t) => sum + (t.litrage_station || 0), 0) || 0;
  const totalKm = trips?.reduce((sum, t) => sum + (t.parcours_total || 0), 0) || 0;
  const totalContainers = trips?.reduce(
    (sum, t) =>
      sum +
      ((t.conteneurs as unknown as { quantite: number }[])?.reduce(
        (s, c) => s + (c.quantite || 0),
        0,
      ) || 0),
    0,
  ) || 0;

  const averages = {
    fuelPricePerLiter: totalLiters > 0 ? totalFuel / totalLiters : 0,
    costPerKm: totalKm > 0 ? total / totalKm : 0,
    costPerTrip: totalTrips > 0 ? total / totalTrips : 0,
    costPerContainer: totalContainers > 0 ? total / totalContainers : 0,
  };

  // Simple trend detection (compare first half vs second half of period)
  const midDate = new Date(
    (dateFrom.getTime() + dateTo.getTime()) / 2,
  );

  const firstHalfTrips = trips?.filter(
    (t) => new Date(t.date_trajet) < midDate,
  );
  const secondHalfTrips = trips?.filter(
    (t) => new Date(t.date_trajet) >= midDate,
  );

  const firstHalfFuel = firstHalfTrips?.reduce((sum, t) => sum + (t.montant_carburant || 0), 0) || 0;
  const secondHalfFuel = secondHalfTrips?.reduce((sum, t) => sum + (t.montant_carburant || 0), 0) || 0;
  const firstHalfTotal = firstHalfTrips?.reduce((sum, t) => sum + (t.cout_total || 0), 0) || 0;
  const secondHalfTotal = secondHalfTrips?.reduce((sum, t) => sum + (t.cout_total || 0), 0) || 0;

  let fuelCostTrend: "up" | "down" | "stable" = "stable";
  let totalCostTrend: "up" | "down" | "stable" = "stable";

  if (firstHalfFuel > 0) {
    const fuelChange = ((secondHalfFuel - firstHalfFuel) / firstHalfFuel) * 100;
    if (fuelChange > 10) fuelCostTrend = "up";
    else if (fuelChange < -10) fuelCostTrend = "down";
  }

  if (firstHalfTotal > 0) {
    const totalChange = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
    if (totalChange > 10) totalCostTrend = "up";
    else if (totalChange < -10) totalCostTrend = "down";
  }

  return {
    totalCosts: {
      fuel: totalFuel,
      tolls: totalTolls,
      other: totalOther,
      subcontracting: totalSubcontracting,
      total,
    },
    costsByCategory,
    costsByMonth,
    costsByDestination,
    averages,
    trends: {
      fuelCostTrend,
      totalCostTrend,
    },
  };
}

// =============================================================================
// Detailed Trips
// =============================================================================

export async function getReportTrips(
  dateFrom: Date,
  dateTo: Date,
  chauffeurId?: string,
  vehiculeId?: string,
  destinationId?: string,
): Promise<ReportTrip[]> {
  const supabase = await createClient();

  let query = supabase
    .from("trajet")
    .select(
      `
      id,
      numero_trajet,
      date_trajet,
      parcours_total,
      litrage_station,
      consommation_au_100,
      montant_carburant,
      cout_total,
      statut,
      ecart_litrage,
      chauffeur:chauffeur(nom, prenom),
      vehicule:vehicule(immatriculation, marque, modele),
      depart:localite_depart_id(nom),
      destination:localite_destination_id(nom),
      conteneurs:conteneur_trajet(quantite)
    `,
    )
    .gte("date_trajet", formatDateForQuery(dateFrom))
    .lte("date_trajet", formatDateForQuery(dateTo))
    .order("date_trajet", { ascending: false });

  // Apply filters
  if (chauffeurId) {
    query = query.eq("chauffeur_id", chauffeurId);
  }
  if (vehiculeId) {
    query = query.eq("vehicule_id", vehiculeId);
  }
  if (destinationId) {
    query = query.eq("localite_destination_id", destinationId);
  }

  const { data: trips } = await query;

  return (
    trips?.map((trip) => {
      const chauffeur = trip.chauffeur as unknown as {
        nom: string;
        prenom: string;
      };
      const vehicule = trip.vehicule as unknown as {
        immatriculation: string;
        marque: string;
        modele: string;
      };
      const depart = trip.depart as unknown as { nom: string };
      const destination = trip.destination as unknown as { nom: string };
      const conteneurs = (trip.conteneurs as unknown as { quantite: number }[]) || [];

      const alerts: string[] = [];
      if (Math.abs(trip.ecart_litrage || 0) > 10) {
        alerts.push("Écart carburant >10L");
      }
      if ((trip.consommation_au_100 || 0) > 50) {
        alerts.push("Consommation anormale");
      }

      return {
        id: trip.id,
        numero_trajet: trip.numero_trajet,
        date: new Date(trip.date_trajet),
        chauffeur: `${chauffeur?.prenom || ""} ${chauffeur?.nom || ""}`.trim(),
        vehicule: vehicule?.immatriculation || "",
        depart: depart?.nom || "",
        destination: destination?.nom || "",
        km: trip.parcours_total || 0,
        containers: conteneurs.reduce((sum, c) => sum + (c.quantite || 0), 0),
        fuelLiters: trip.litrage_station || 0,
        consumption: trip.consommation_au_100 || 0,
        fuelCost: trip.montant_carburant || 0,
        totalCost: trip.cout_total || 0,
        status: trip.statut || "",
        alerts: alerts.length > 0 ? alerts : undefined,
      };
    }) || []
  );
}
