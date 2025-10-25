/**
 * Report Summary Component
 *
 * Executive summary section of report
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExecutiveSummary } from "@/lib/report-types";
import { formatCurrency, formatConsumption, formatPercentageChange } from "@/lib/format-utils";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

interface ReportSummaryProps {
  summary: ExecutiveSummary;
}

export function ReportSummary({ summary }: ReportSummaryProps) {
  const getTrendIcon = (change: number) => {
    if (change > 2) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < -2) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Résumé Exécutif</h2>
        <p className="text-muted-foreground">{summary.period.label}</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trajets</CardTitle>
            {getTrendIcon(summary.kpis.tripsChange)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.kpis.totalTrips}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentageChange(summary.kpis.tripsChange)} vs période
              précédente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conteneurs</CardTitle>
            {getTrendIcon(summary.kpis.containersChange)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.kpis.totalContainers}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentageChange(summary.kpis.containersChange)} vs
              période précédente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
            {getTrendIcon(summary.kpis.costChange)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.kpis.totalCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              Carburant: {formatCurrency(summary.kpis.totalFuelCost)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consommation</CardTitle>
            {summary.kpis.consumptionTrend === "up" ? (
              <TrendingUp className="h-4 w-4 text-orange-600" />
            ) : summary.kpis.consumptionTrend === "down" ? (
              <TrendingDown className="h-4 w-4 text-green-600" />
            ) : (
              <Minus className="h-4 w-4 text-gray-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatConsumption(summary.kpis.averageConsumption)}
            </div>
            <p className="text-xs text-muted-foreground">
              Moyenne de la flotte
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Highlights */}
      {summary.highlights && summary.highlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Points clés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
