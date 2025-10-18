/**
 * Costs Chart Component
 *
 * Area chart showing fuel costs over time
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrency } from "@/lib/format-utils";
import type { CostChartData } from "@/lib/dashboard-types";

interface CostsChartProps {
  data: CostChartData[];
  loading?: boolean;
}

export function CostsChart({ data, loading }: CostsChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution des coûts carburant</CardTitle>
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
        <CardTitle>Évolution des coûts carburant</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                format(new Date(value), "dd MMM", { locale: fr })
              }
              className="text-xs"
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              className="text-xs"
            />
            <Tooltip
              labelFormatter={(value) =>
                format(new Date(value), "dd MMMM yyyy", { locale: fr })
              }
              formatter={(value: number) => [formatCurrency(value), "Coût carburant"]}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Area
              type="monotone"
              dataKey="totalCost"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorCost)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
