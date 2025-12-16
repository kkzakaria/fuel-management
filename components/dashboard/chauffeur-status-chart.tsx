/**
 * Chauffeur Status Chart Component
 *
 * Pie chart showing chauffeur distribution by status
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
import type { ChauffeurStatusStats } from "@/lib/dashboard-types";

interface ChauffeurStatusChartProps {
  data: ChauffeurStatusStats[];
  totalChauffeurs: number;
  loading?: boolean;
}

export function ChauffeurStatusChart({
  data,
  totalChauffeurs,
  loading,
}: ChauffeurStatusChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statut des chauffeurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statut des chauffeurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Aucun chauffeur enregistré
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Statut des chauffeurs</span>
          <span className="text-sm font-normal text-muted-foreground">
            {totalChauffeurs} chauffeur{totalChauffeurs > 1 ? "s" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${(entry["percentage"] as number).toFixed(0)}%`}
              outerRadius={80}
              fill="hsl(var(--primary))"
              dataKey="count"
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.statut}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, _name: string, props) => [
                `${value} chauffeur${value > 1 ? "s" : ""} (${props.payload.percentage.toFixed(1)}%)`,
                props.payload.label,
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
              formatter={(_value, entry) =>
                (entry as unknown as { payload: ChauffeurStatusStats }).payload
                  .label
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
