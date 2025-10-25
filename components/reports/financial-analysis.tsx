/**
 * Financial Analysis Component
 *
 * Financial analysis section with costs breakdown
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FinancialAnalysis } from "@/lib/report-types";
import { formatCurrency, formatPercentage } from "@/lib/format-utils";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface FinancialAnalysisProps {
  analysis: FinancialAnalysis;
}

export function FinancialAnalysis({ analysis }: FinancialAnalysisProps) {
  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-red-600" />;
    if (trend === "down")
      return <TrendingDown className="h-4 w-4 text-green-600" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analyse Financière</h2>
        <p className="text-muted-foreground">Répartition et évolution des coûts</p>
      </div>

      {/* Total Costs Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Coûts Totaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">Carburant</span>
              <span className="text-lg font-bold">
                {formatCurrency(analysis.totalCosts.fuel)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">Péages</span>
              <span className="text-lg font-bold">
                {formatCurrency(analysis.totalCosts.tolls)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">Autres frais</span>
              <span className="text-lg font-bold">
                {formatCurrency(analysis.totalCosts.other)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">Sous-traitance</span>
              <span className="text-lg font-bold">
                {formatCurrency(analysis.totalCosts.subcontracting)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t-2 pt-3">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(analysis.totalCosts.total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.costsByCategory.map((category) => (
              <div key={category.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category.category}</span>
                  <span>
                    {formatCurrency(category.amount)} (
                    {formatPercentage(category.percentage, 1)})
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${category.percentage}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Averages */}
        <Card>
          <CardHeader>
            <CardTitle>Moyennes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Prix litre carburant
                </span>
                <span className="font-medium">
                  {formatCurrency(analysis.averages.fuelPricePerLiter)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Coût par km
                </span>
                <span className="font-medium">
                  {formatCurrency(analysis.averages.costPerKm)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Coût par trajet
                </span>
                <span className="font-medium">
                  {formatCurrency(analysis.averages.costPerTrip)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Coût par conteneur
                </span>
                <span className="font-medium">
                  {formatCurrency(analysis.averages.costPerContainer)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Tendances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Coût carburant</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(analysis.trends.fuelCostTrend)}
                  <span className="text-sm">
                    {analysis.trends.fuelCostTrend === "up"
                      ? "En hausse"
                      : analysis.trends.fuelCostTrend === "down"
                        ? "En baisse"
                        : "Stable"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Coûts totaux</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(analysis.trends.totalCostTrend)}
                  <span className="text-sm">
                    {analysis.trends.totalCostTrend === "up"
                      ? "En hausse"
                      : analysis.trends.totalCostTrend === "down"
                        ? "En baisse"
                        : "Stable"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Destinations by Cost */}
      {analysis.costsByDestination.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Destinations par Coût</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destination</TableHead>
                  <TableHead className="text-right">Trajets</TableHead>
                  <TableHead className="text-right">Conteneurs</TableHead>
                  <TableHead className="text-right">Coût Total</TableHead>
                  <TableHead className="text-right">Coût Moyen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.costsByDestination.map((dest) => (
                  <TableRow key={dest.destination}>
                    <TableCell className="font-medium">
                      {dest.destination}
                    </TableCell>
                    <TableCell className="text-right">{dest.trips}</TableCell>
                    <TableCell className="text-right">
                      {dest.containers}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(dest.totalCost)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(dest.averageCost)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
