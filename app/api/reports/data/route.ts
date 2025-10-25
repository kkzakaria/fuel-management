/**
 * API Route: /api/reports/data
 *
 * Prepare report data based on filters
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getExecutiveSummary,
  getFleetPerformance,
  getFinancialAnalysis,
  getReportTrips,
} from "@/lib/supabase/report-queries";
import type {
  MonthlyReport,
  DriverReport,
  VehicleReport,
  DestinationReport,
  FinancialReport,
} from "@/lib/report-types";
import { reportFiltersSchema } from "@/lib/validations/report";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const filters = reportFiltersSchema.parse({
      ...body,
      dateFrom: new Date(body.dateFrom),
      dateTo: new Date(body.dateTo),
    });

    // Generate report based on type
    switch (filters.reportType) {
      case "monthly": {
        const [executiveSummary, fleetPerformance, financialAnalysis, detailedTrips] =
          await Promise.all([
            getExecutiveSummary(filters.dateFrom, filters.dateTo),
            getFleetPerformance(filters.dateFrom, filters.dateTo),
            getFinancialAnalysis(filters.dateFrom, filters.dateTo),
            filters.includeTables
              ? getReportTrips(filters.dateFrom, filters.dateTo)
              : Promise.resolve([]),
          ]);

        const report: MonthlyReport = {
          type: "monthly",
          filters,
          executiveSummary,
          fleetPerformance,
          financialAnalysis,
          detailedTrips: filters.includeTables ? detailedTrips : undefined,
          generatedAt: new Date(),
        };

        return NextResponse.json(report);
      }

      case "driver": {
        if (!filters.chauffeurId) {
          return NextResponse.json(
            { error: "Driver ID is required for driver report" },
            { status: 400 },
          );
        }

        // Import client queries for driver details
        const { fetchDriverDetails } = await import(
          "@/lib/supabase/report-queries-client"
        );

        const [driver, trips, fleetPerformance] = await Promise.all([
          fetchDriverDetails(filters.chauffeurId),
          getReportTrips(
            filters.dateFrom,
            filters.dateTo,
            filters.chauffeurId,
          ),
          getFleetPerformance(filters.dateFrom, filters.dateTo),
        ]);

        // Find driver in fleet performance
        const allDrivers = [
          ...fleetPerformance.topDrivers,
          ...fleetPerformance.bottomDrivers,
        ];
        const driverPerformance = allDrivers.find(
          (d) => d.id === filters.chauffeurId,
        );

        if (!driverPerformance) {
          return NextResponse.json(
            { error: "Driver performance data not found" },
            { status: 404 },
          );
        }

        // Calculate statistics
        const statistics = {
          totalTrips: trips.length,
          totalKm: trips.reduce((sum, t) => sum + t.km, 0),
          totalContainers: trips.reduce((sum, t) => sum + t.containers, 0),
          averageConsumption:
            trips.length > 0
              ? trips.reduce((sum, t) => sum + t.consumption, 0) / trips.length
              : 0,
          totalCost: trips.reduce((sum, t) => sum + t.totalCost, 0),
          tripsWithAlerts: trips.filter((t) => t.alerts && t.alerts.length > 0)
            .length,
        };

        // Calculate comparison
        const avgFleetConsumption =
          fleetPerformance.averageMetrics.consumptionPerVehicle;
        const avgFleetCostPerTrip = fleetPerformance.averageMetrics.costPerTrip;

        const comparison = {
          vsAverageConsumption:
            avgFleetConsumption > 0
              ? ((statistics.averageConsumption - avgFleetConsumption) /
                  avgFleetConsumption) *
                100
              : 0,
          vsAverageCost:
            avgFleetCostPerTrip > 0 &&
            statistics.totalTrips > 0
              ? ((statistics.totalCost / statistics.totalTrips -
                  avgFleetCostPerTrip) /
                  avgFleetCostPerTrip) *
                100
              : 0,
          ranking:
            allDrivers.findIndex((d) => d.id === filters.chauffeurId) + 1,
          totalDrivers: allDrivers.length,
        };

        const report: DriverReport = {
          type: "driver",
          filters,
          driver: {
            id: driver.id,
            nom: driver.nom,
            prenom: driver.prenom,
            telephone: driver.telephone || "",
            dateEmbauche: new Date(driver.date_embauche),
          },
          performance: driverPerformance,
          trips,
          statistics,
          comparison,
          generatedAt: new Date(),
        };

        return NextResponse.json(report);
      }

      case "vehicle": {
        if (!filters.vehiculeId) {
          return NextResponse.json(
            { error: "Vehicle ID is required for vehicle report" },
            { status: 400 },
          );
        }

        const { fetchVehicleDetails } = await import(
          "@/lib/supabase/report-queries-client"
        );

        const [vehicle, trips, fleetPerformance] = await Promise.all([
          fetchVehicleDetails(filters.vehiculeId),
          getReportTrips(
            filters.dateFrom,
            filters.dateTo,
            undefined,
            filters.vehiculeId,
          ),
          getFleetPerformance(filters.dateFrom, filters.dateTo),
        ]);

        // Find vehicle in fleet performance
        const allVehicles = [
          ...fleetPerformance.topVehicles,
          ...fleetPerformance.bottomVehicles,
        ];
        const vehiclePerformance = allVehicles.find(
          (v) => v.id === filters.vehiculeId,
        );

        if (!vehiclePerformance) {
          return NextResponse.json(
            { error: "Vehicle performance data not found" },
            { status: 404 },
          );
        }

        // Calculate statistics
        const statistics = {
          totalTrips: trips.length,
          totalKm: trips.reduce((sum, t) => sum + t.km, 0),
          averageConsumption:
            trips.length > 0
              ? trips.reduce((sum, t) => sum + t.consumption, 0) / trips.length
              : 0,
          totalFuelCost: trips.reduce((sum, t) => sum + t.fuelCost, 0),
          totalMaintenanceCost: 0, // TODO: Add maintenance tracking
        };

        // Calculate comparison
        const avgFleetConsumption =
          fleetPerformance.averageMetrics.consumptionPerVehicle;
        const avgFleetCostPerTrip = fleetPerformance.averageMetrics.costPerTrip;

        const comparison = {
          vsAverageConsumption:
            avgFleetConsumption > 0
              ? ((statistics.averageConsumption - avgFleetConsumption) /
                  avgFleetConsumption) *
                100
              : 0,
          vsAverageCost:
            avgFleetCostPerTrip > 0 &&
            statistics.totalTrips > 0
              ? ((statistics.totalFuelCost / statistics.totalTrips -
                  avgFleetCostPerTrip) /
                  avgFleetCostPerTrip) *
                100
              : 0,
          ranking:
            allVehicles.findIndex((v) => v.id === filters.vehiculeId) + 1,
          totalVehicles: allVehicles.length,
        };

        // Check alerts
        const alerts = {
          maintenanceNeeded: vehicle.kilometrage > 150000,
          abnormalConsumption: statistics.averageConsumption > avgFleetConsumption * 1.3,
          highMileage: vehicle.kilometrage > 200000,
        };

        const report: VehicleReport = {
          type: "vehicle",
          filters,
          vehicle: {
            id: vehicle.id,
            immatriculation: vehicle.immatriculation,
            marque: vehicle.marque,
            modele: vehicle.modele,
            annee: vehicle.annee,
            typeCarburant: vehicle.type_carburant,
            kilometrage: vehicle.kilometrage || 0,
          },
          performance: vehiclePerformance,
          trips,
          statistics,
          comparison,
          alerts,
          generatedAt: new Date(),
        };

        return NextResponse.json(report);
      }

      case "destination": {
        if (!filters.destinationId) {
          return NextResponse.json(
            { error: "Destination ID is required for destination report" },
            { status: 400 },
          );
        }

        const { fetchDestinationDetails } = await import(
          "@/lib/supabase/report-queries-client"
        );

        const [destination, trips] = await Promise.all([
          fetchDestinationDetails(filters.destinationId),
          getReportTrips(
            filters.dateFrom,
            filters.dateTo,
            undefined,
            undefined,
            filters.destinationId,
          ),
        ]);

        // Calculate statistics
        const statistics = {
          totalTrips: trips.length,
          totalContainers: trips.reduce((sum, t) => sum + t.containers, 0),
          totalKm: trips.reduce((sum, t) => sum + t.km, 0),
          averageCost:
            trips.length > 0
              ? trips.reduce((sum, t) => sum + t.totalCost, 0) / trips.length
              : 0,
          totalCost: trips.reduce((sum, t) => sum + t.totalCost, 0),
        };

        // Aggregate trips by month
        const tripsPerMonth = new Map<string, number>();
        const costsPerMonth = new Map<string, number>();

        trips.forEach((trip) => {
          const monthKey = new Intl.DateTimeFormat("fr-FR", {
            year: "numeric",
            month: "short",
          }).format(trip.date);

          tripsPerMonth.set(monthKey, (tripsPerMonth.get(monthKey) || 0) + 1);
          costsPerMonth.set(
            monthKey,
            (costsPerMonth.get(monthKey) || 0) + trip.totalCost,
          );
        });

        const trends = {
          tripsPerMonth: Array.from(tripsPerMonth.entries()).map(
            ([month, count]) => ({
              month,
              count,
            }),
          ),
          costsPerMonth: Array.from(costsPerMonth.entries()).map(
            ([month, cost]) => ({
              month,
              cost,
            }),
          ),
        };

        // Top drivers and vehicles
        const driverCounts = new Map<string, number>();
        const vehicleCounts = new Map<string, number>();

        trips.forEach((trip) => {
          driverCounts.set(
            trip.chauffeur,
            (driverCounts.get(trip.chauffeur) || 0) + 1,
          );
          vehicleCounts.set(
            trip.vehicule,
            (vehicleCounts.get(trip.vehicule) || 0) + 1,
          );
        });

        const topDrivers = Array.from(driverCounts.entries())
          .map(([name, trips]) => {
            const [prenom, ...nomParts] = name.split(" ");
            return {
              nom: nomParts.join(" ") || "",
              prenom: prenom || "",
              trips,
            };
          })
          .sort((a, b) => b.trips - a.trips)
          .slice(0, 5);

        const topVehicles = Array.from(vehicleCounts.entries())
          .map(([immatriculation, trips]) => ({
            immatriculation,
            trips,
          }))
          .sort((a, b) => b.trips - a.trips)
          .slice(0, 5);

        const report: DestinationReport = {
          type: "destination",
          filters,
          destination: {
            id: destination.id,
            nom: destination.nom,
            region: destination.region || "",
          },
          statistics,
          trips,
          trends,
          topDrivers,
          topVehicles,
          generatedAt: new Date(),
        };

        return NextResponse.json(report);
      }

      case "financial": {
        const [financialAnalysis, detailedTrips] = await Promise.all([
          getFinancialAnalysis(filters.dateFrom, filters.dateTo),
          filters.includeTables
            ? getReportTrips(filters.dateFrom, filters.dateTo)
            : Promise.resolve([]),
        ]);

        // TODO: Add subcontracting missions

        const report: FinancialReport = {
          type: "financial",
          filters,
          financialAnalysis,
          detailedCosts: {
            trips: filters.includeTables ? detailedTrips : [],
            subcontractingMissions: [], // TODO: Fetch from MISSION_SOUS_TRAITANCE
          },
          generatedAt: new Date(),
        };

        return NextResponse.json(report);
      }

      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
