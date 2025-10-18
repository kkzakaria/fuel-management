/**
 * Alert Dropdown Component
 *
 * Displays list of active alerts in dropdown
 */

"use client";

import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts } from "@/hooks/use-alerts";
import { formatCurrency } from "@/lib/format-utils";
import type { AlertSeverity } from "@/lib/dashboard-types";

const severityConfig: Record<
  AlertSeverity,
  { icon: typeof AlertCircle; variant: "destructive" | "default" | "secondary" }
> = {
  critical: { icon: AlertCircle, variant: "destructive" },
  warning: { icon: AlertTriangle, variant: "default" },
  info: { icon: Info, variant: "secondary" },
};

export function AlertDropdown() {
  const { alerts, loading } = useAlerts({
    limit: 5,
    enabled: true,
    autoRefresh: true,
    refreshInterval: 60000,
  });

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-4 w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-8 text-center">
        <Info className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Aucune alerte active
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-96">
      <div className="flex items-center justify-between p-4 pb-2">
        <h4 className="text-sm font-semibold">Alertes actives</h4>
        <Badge variant="secondary">{alerts.length}</Badge>
      </div>
      <Separator />
      <ScrollArea className="h-full">
        <div className="space-y-1 p-2">
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className="flex gap-3 rounded-lg p-3 hover:bg-accent transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">
                      {alert.title}
                    </p>
                    <Badge
                      variant={config.variant}
                      className="text-xs flex-shrink-0"
                    >
                      {alert.severity === "critical"
                        ? "Critique"
                        : alert.severity === "warning"
                          ? "Attention"
                          : "Info"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {alert.description}
                  </p>
                  {alert.metadata && (
                    <div className="text-xs text-muted-foreground">
                      {alert.type === "fuel_variance" && (
                        <span>
                          Écart: {alert.metadata.ecart_litrage?.toFixed(1)}L
                        </span>
                      )}
                      {alert.type === "abnormal_consumption" && (
                        <span>
                          {alert.metadata.consommation_au_100?.toFixed(2)}L/100km
                        </span>
                      )}
                      {alert.type === "pending_payment" && (
                        <span>
                          Montant: {formatCurrency(alert.metadata.reste_10_pourcent || 0)}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(alert.date), "dd MMM yyyy à HH:mm", {
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
