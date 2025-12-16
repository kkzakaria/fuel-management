/**
 * Dashboard Page
 *
 * Main dashboard with KPIs, charts, and statistics
 */

"use client";

import { useState } from "react";
import {
  TruckIcon,
  Package,
  Fuel,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChauffeurStatsCards } from "@/components/dashboard/chauffeur-stats-cards";
import { TripsChart } from "@/components/dashboard/trips-chart";
import { ContainersChart } from "@/components/dashboard/containers-chart";
import { ConsumptionChart } from "@/components/dashboard/consumption-chart";
import { CostsChart } from "@/components/dashboard/costs-chart";
import { ChauffeurStatusChart } from "@/components/dashboard/chauffeur-status-chart";
import { useStats } from "@/hooks/use-stats";
import { useContainerStats } from "@/hooks/use-container-stats";
import { useFuelStats } from "@/hooks/use-fuel-stats";
import { useChauffeurStatusStats } from "@/hooks/use-chauffeur-status-stats";
import { formatCurrency, formatConsumption } from "@/lib/format-utils";
import type { PeriodPreset } from "@/lib/dashboard-types";

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodPreset>("month");

  const { stats, alertCount, tripChartData, costChartData, loading } = useStats(
    { period },
  );
  const { containerStats, loading: containersLoading } = useContainerStats({
    period,
  });
  const { vehicleStats, loading: fuelLoading } = useFuelStats({
    period,
    limit: 5,
  });
  const { chauffeurStats, totalChauffeurs, loading: chauffeurLoading } =
    useChauffeurStatusStats();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Vue d&apos;ensemble de vos opérations
          </p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Chauffeur Stats Cards - First Row */}
      <ChauffeurStatsCards
        chauffeurStats={chauffeurStats}
        totalChauffeurs={totalChauffeurs}
        loading={chauffeurLoading}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Trajets"
          value={stats?.totalTrips || 0}
          icon={TruckIcon}
          trend={
            stats
              ? {
                  value: stats.tripsChange,
                  isPositive: stats.tripsChange >= 0,
                }
              : undefined
          }
          loading={loading}
        />
        <StatCard
          title="Conteneurs"
          value={stats?.totalContainers || 0}
          icon={Package}
          description={`${stats?.containersByType.type20 || 0} × 20' | ${stats?.containersByType.type40 || 0} × 40'`}
          loading={loading}
        />
        <StatCard
          title="Coût carburant"
          value={formatCurrency(stats?.totalFuelCost || 0)}
          icon={Fuel}
          trend={
            stats
              ? {
                  value: stats.fuelCostChange,
                  isPositive: stats.fuelCostChange <= 0, // Lower is better for costs
                }
              : undefined
          }
          loading={loading}
        />
        <StatCard
          title="Consommation moyenne"
          value={formatConsumption(stats?.averageConsumption || 0)}
          icon={TrendingUp}
          description={
            stats?.consumptionTrend === "up"
              ? "En hausse"
              : stats?.consumptionTrend === "down"
                ? "En baisse"
                : "Stable"
          }
          loading={loading}
        />
      </div>

      {/* Alerts Summary */}
      {alertCount > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="font-medium text-destructive">
              {alertCount} alerte{alertCount > 1 ? "s" : ""} active
              {alertCount > 1 ? "s" : ""}
            </p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Consultez les alertes dans le menu de notification
          </p>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Trips Chart */}
        <TripsChart data={tripChartData} loading={loading} />

        {/* Containers Chart */}
        <ContainersChart data={containerStats} loading={containersLoading} />

        {/* Costs Chart */}
        <CostsChart data={costChartData} loading={loading} />

        {/* Consumption Chart */}
        <ConsumptionChart data={vehicleStats} loading={fuelLoading} />

        {/* Chauffeur Status Chart */}
        <ChauffeurStatusChart
          data={chauffeurStats}
          totalChauffeurs={totalChauffeurs}
          loading={chauffeurLoading}
        />
      </div>
    </div>
  );
}
