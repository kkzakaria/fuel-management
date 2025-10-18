/**
 * Consumption Chart Component
 *
 * Bar chart showing vehicle fuel consumption
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { VehicleConsumption } from "@/lib/dashboard-types";

interface ConsumptionChartProps {
  data: VehicleConsumption[];
  loading?: boolean;
}

export function ConsumptionChart({ data, loading }: ConsumptionChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top véhicules - Consommation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top véhicules - Consommation</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              unit="L/100km"
              className="text-xs"
            />
            <YAxis
              type="category"
              dataKey="immatriculation"
              className="text-xs"
              width={100}
            />
            <Tooltip
              formatter={(value: number) => [
                `${value.toFixed(2)} L/100km`,
                "Consommation",
              ]}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Bar
              dataKey="avgConsumption"
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
