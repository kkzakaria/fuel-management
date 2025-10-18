/**
 * Alerts Queries - Client Side
 *
 * Client-side queries for alerts (for use in hooks)
 */

import { createBrowserClient } from "@supabase/ssr";
import type {
  Alert,
  FuelVarianceAlert,
  AbnormalConsumptionAlert,
  PendingPaymentAlert,
} from "../dashboard-types";

// Create browser client
function getClient() {
  return createBrowserClient(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
  );
}

// =============================================================================
// Get All Active Alerts
// =============================================================================

export async function getActiveAlerts(limit: number = 10): Promise<Alert[]> {
  const alerts: Alert[] = [];

  // Get fuel variance alerts
  const fuelAlerts = await getFuelVarianceAlerts(limit);
  alerts.push(...fuelAlerts);

  // Get abnormal consumption alerts
  const consumptionAlerts = await getAbnormalConsumptionAlerts(limit);
  alerts.push(...consumptionAlerts);

  // Get pending payment alerts
  const paymentAlerts = await getPendingPaymentAlerts(limit);
  alerts.push(...paymentAlerts);

  // Sort by creation date (most recent first)
  return alerts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// =============================================================================
// Fuel Variance Alerts
// =============================================================================

export async function getFuelVarianceAlerts(
  limit: number = 5,
): Promise<FuelVarianceAlert[]> {
  const supabase = getClient();

  const { data } = await supabase
    .from("TRAJET")
    .select(
      `
      id,
      ecart_litrage,
      litrage_prevu,
      litrage_station,
      created_at,
      chauffeur:CHAUFFEUR(nom, prenom),
      vehicule:VEHICULE(immatriculation, marque, modele)
    `,
    )
    .not("ecart_litrage", "is", null)
    .or("ecart_litrage.gt.10,ecart_litrage.lt.-10")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data) return [];

  return data.map((trip) => {
    const chauffeur = Array.isArray(trip.chauffeur) ? trip.chauffeur[0] : trip.chauffeur;
    const vehicule = Array.isArray(trip.vehicule) ? trip.vehicule[0] : trip.vehicule;

    const variance = Math.abs(trip.ecart_litrage || 0);
    const severity: "critical" | "warning" =
      variance > 20 ? "critical" : "warning";

    return {
      id: `fuel-variance-${trip.id}`,
      type: "fuel_variance" as const,
      severity,
      title: `Écart carburant détecté: ${variance.toFixed(1)}L`,
      description: `Le véhicule ${vehicule?.immatriculation || "N/A"} conduit par ${chauffeur?.nom || "N/A"} ${chauffeur?.prenom || "N/A"} présente un écart de ${variance.toFixed(1)}L entre le litrage prévu et acheté.`,
      date: trip.created_at || new Date().toISOString(),
      data: {
        tripId: trip.id,
        chauffeur: `${chauffeur?.nom || ""} ${chauffeur?.prenom || ""}`.trim(),
        vehicule: vehicule?.immatriculation || "N/A",
        expectedLiters: trip.litrage_prevu || 0,
        actualLiters: trip.litrage_station || 0,
        variance: trip.ecart_litrage || 0,
      },
    };
  });
}

// =============================================================================
// Abnormal Consumption Alerts
// =============================================================================

export async function getAbnormalConsumptionAlerts(
  limit: number = 5,
): Promise<AbnormalConsumptionAlert[]> {
  const supabase = getClient();

  // Get vehicles
  const { data: vehicleData } = await supabase
    .from("VEHICULE")
    .select("id, immatriculation, marque, modele");

  if (!vehicleData) return [];

  const alerts: AbnormalConsumptionAlert[] = [];

  for (const vehicle of vehicleData) {
    // Get average consumption for this vehicle
    const { data: tripData } = await supabase
      .from("TRAJET")
      .select("consommation_au_100")
      .eq("vehicule_id", vehicle.id)
      .not("consommation_au_100", "is", null)
      .limit(10);

    if (!tripData || tripData.length < 3) continue;

    const avgConsumption =
      tripData.reduce((sum, t) => sum + (t.consommation_au_100 || 0), 0) /
      tripData.length;

    // Get recent trips with high consumption
    const { data: abnormalTrips } = await supabase
      .from("TRAJET")
      .select("id, consommation_au_100, created_at")
      .eq("vehicule_id", vehicle.id)
      .gt("consommation_au_100", avgConsumption * 1.3)
      .order("created_at", { ascending: false })
      .limit(2);

    if (!abnormalTrips || abnormalTrips.length === 0) continue;

    abnormalTrips.forEach((trip) => {
      const consumption = trip.consommation_au_100 || 0;
      const percentageAbove =
        ((consumption - avgConsumption) / avgConsumption) * 100;

      alerts.push({
        id: `abnormal-consumption-${trip.id}`,
        type: "abnormal_consumption" as const,
        severity: percentageAbove > 50 ? "critical" : "warning",
        title: `Consommation anormale: ${consumption.toFixed(2)} L/100km`,
        description: `Le véhicule ${vehicle.immatriculation} a une consommation de ${consumption.toFixed(2)} L/100km, soit ${percentageAbove.toFixed(0)}% au-dessus de sa moyenne (${avgConsumption.toFixed(2)} L/100km).`,
        date: trip.created_at || new Date().toISOString(),
        data: {
          tripId: trip.id,
          vehicule: `${vehicle.marque || ""} ${vehicle.modele || ""}`.trim() || vehicle.immatriculation,
          consumption,
          averageConsumption: avgConsumption,
          percentageAbove,
        },
      });
    });

    if (alerts.length >= limit) break;
  }

  return alerts.slice(0, limit);
}

// =============================================================================
// Pending Payment Alerts
// =============================================================================

export async function getPendingPaymentAlerts(
  limit: number = 5,
): Promise<PendingPaymentAlert[]> {
  const supabase = getClient();

  const { data } = await supabase
    .from("MISSION_SOUS_TRAITANCE")
    .select(
      `
      id,
      reste_10_pourcent,
      date_programmation,
      created_at,
      sous_traitant:SOUS_TRAITANT(nom_entreprise)
    `,
    )
    .gt("reste_10_pourcent", 0)
    .eq("statut_paiement_final", "non_paye")
    .order("date_programmation", { ascending: true })
    .limit(limit);

  if (!data) return [];

  return data.map((mission) => {
    const sousTraitant = Array.isArray(mission.sous_traitant) ? mission.sous_traitant[0] : mission.sous_traitant;

    // Calculate days since mission
    const missionDate = new Date(mission.date_programmation);
    const now = new Date();
    const daysOverdue = Math.floor(
      (now.getTime() - missionDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const severity: "critical" | "warning" | "info" =
      daysOverdue > 30 ? "critical" : daysOverdue > 15 ? "warning" : "info";

    return {
      id: `pending-payment-${mission.id}`,
      type: "pending_payment" as const,
      severity,
      title: `Paiement 10% en attente`,
      description: `Le solde de ${mission.reste_10_pourcent?.toFixed(0)} FCFA pour ${sousTraitant?.nom_entreprise || "Sous-traitant"} est en attente depuis ${daysOverdue} jours.`,
      date: mission.created_at || new Date().toISOString(),
      data: {
        missionId: mission.id,
        sousTraitant: sousTraitant?.nom_entreprise || "Inconnu",
        remainingAmount: mission.reste_10_pourcent || 0,
        daysOverdue,
      },
    };
  });
}

// =============================================================================
// Get Alert Count
// =============================================================================

export async function getAlertCount(): Promise<number> {
  const supabase = getClient();

  // Count fuel variance alerts
  const { count: fuelCount } = await supabase
    .from("TRAJET")
    .select("*", { count: "exact", head: true })
    .or("ecart_litrage.gt.10,ecart_litrage.lt.-10");

  // Count pending payments
  const { count: paymentCount } = await supabase
    .from("MISSION_SOUS_TRAITANCE")
    .select("*", { count: "exact", head: true })
    .gt("reste_10_pourcent", 0)
    .eq("statut_paiement_final", "non_paye");

  return (fuelCount || 0) + (paymentCount || 0);
}
