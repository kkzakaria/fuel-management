/**
 * Containers Chart Component
 *
 * Pie chart showing container type distribution
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { ContainerStats } from "@/lib/dashboard-types";

interface ContainersChartProps {
  data: ContainerStats[];
  loading?: boolean;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export function ContainersChart({ data, loading }: ContainersChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Répartition des conteneurs</CardTitle>
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
        <CardTitle>Répartition des conteneurs</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.percentage.toFixed(1)}%`}
              outerRadius={80}
              fill="hsl(var(--primary))"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.type}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props) => [
                `${value} conteneurs (${props.payload.percentage.toFixed(1)}%)`,
                props.payload.type,
              ]}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string, entry: { payload: ContainerStats }) =>
                entry.payload.type
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
