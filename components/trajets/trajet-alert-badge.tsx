/**
 * Composant badge d'alerte pour les trajets
 * Affiche les alertes visuelles pour:
 * - Écart carburant >10L
 * - Consommation anormale (+30% moyenne)
 * - Coût inhabituel
 */

import { AlertTriangle, Fuel, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trajetCalculations } from "@/lib/validations/trajet";

interface TrajetAlertBadgeProps {
  trajet: {
    ecart_litrage: number | null;
    consommation_au_100: number | null;
    litrage_station: number | null;
    prix_litre: number | null;
  };
  consommationMoyenneVehicule?: number | null;
  prixLitreMoyen?: number | null;
}

export function TrajetAlertBadge({
  trajet,
  consommationMoyenneVehicule,
  prixLitreMoyen,
}: TrajetAlertBadgeProps) {
  const alerts: Array<{ type: string; message: string; severity: "error" | "warning" }> = [];

  // Vérifier écart carburant >10L
  if (trajetCalculations.verifierAlerteEcartCarburant(trajet.ecart_litrage)) {
    alerts.push({
      type: "carburant",
      message: `Écart carburant: ${trajet.ecart_litrage?.toFixed(1)}L`,
      severity: "error",
    });
  }

  // Vérifier consommation anormale (+30% moyenne)
  if (
    consommationMoyenneVehicule &&
    trajetCalculations.verifierAlerteConsommationAnormale(
      trajet.consommation_au_100,
      consommationMoyenneVehicule
    )
  ) {
    alerts.push({
      type: "consommation",
      message: "Consommation élevée",
      severity: "warning",
    });
  }

  // Vérifier coût inhabituel (prix au litre +20% au-dessus de la moyenne)
  if (trajet.prix_litre && prixLitreMoyen && trajet.prix_litre > prixLitreMoyen * 1.2) {
    alerts.push({
      type: "cout",
      message: "Coût inhabituel",
      severity: "warning",
    });
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {alerts.map((alert, index) => (
        <Badge
          key={index}
          variant={alert.severity === "error" ? "destructive" : "secondary"}
          className="text-xs"
        >
          {alert.type === "carburant" && <Fuel className="w-3 h-3 mr-1" />}
          {alert.type === "consommation" && <AlertTriangle className="w-3 h-3 mr-1" />}
          {alert.type === "cout" && <DollarSign className="w-3 h-3 mr-1" />}
          {alert.message}
        </Badge>
      ))}
    </div>
  );
}
