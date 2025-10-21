/**
 * Queries Supabase serveur pour statistiques véhicules
 *
 * Queries SQL optimisées pour calculer:
 * - Statistiques individuelles par véhicule
 * - Comparaisons entre véhicules
 * - Graphiques d'évolution
 * - Alertes maintenance
 */

import { createClient } from "./server";

export interface VehiculeStats {
  vehicule_id: string;
  immatriculation: string;
  marque: string | null;
  modele: string | null;
  type_carburant: string | null;
  statut: string;
  kilometrage_actuel: number;
  nb_trajets: number;
  km_parcourus: number;
  conso_moyenne: number;
  cout_carburant_total: number;
  cout_total: number;
}

/**
 * Récupère les statistiques complètes pour un véhicule
 */
export async function getVehiculeStats(vehiculeId: string, options?: {
  dateDebut?: string;
  dateFin?: string;
}): Promise<VehiculeStats> {
  const supabase = await createClient();

  // Récupérer le véhicule
  const { data: vehicule } = await supabase
    .from("vehicule")
    .select("*")
    .eq("id", vehiculeId)
    .single();

  if (!vehicule) {
    throw new Error("Véhicule non trouvé");
  }

  // Récupérer les trajets avec filtres de date
  let trajetQuery = supabase
    .from("trajet")
    .select(`
      id,
      parcours_total,
      consommation_au_100,
      prix_litre,
      frais_peage,
      autres_frais
    `)
    .eq("vehicule_id", vehiculeId);

  if (options?.dateDebut) {
    trajetQuery = trajetQuery.gte("date_trajet", options.dateDebut);
  }
  if (options?.dateFin) {
    trajetQuery = trajetQuery.lte("date_trajet", options.dateFin);
  }

  const { data: trajets } = await trajetQuery;

  // Calculer les stats
  const nb_trajets = trajets?.length || 0;
  const km_parcourus = trajets?.reduce((sum, t) => sum + (Number(t.parcours_total) || 0), 0) || 0;
  const conso_moyenne = nb_trajets > 0
    ? (trajets?.reduce((sum, t) => sum + (Number(t.consommation_au_100) || 0), 0) || 0) / nb_trajets
    : 0;
  const cout_carburant_total = trajets?.reduce((sum, t) => sum + (Number(t.prix_litre) || 0), 0) || 0;
  const cout_total = trajets?.reduce((sum, t) =>
    sum + (Number(t.prix_litre) || 0) + (Number(t.frais_peage) || 0) + (Number(t.autres_frais) || 0), 0
  ) || 0;

  return {
    vehicule_id: vehicule.id,
    immatriculation: vehicule.immatriculation,
    marque: vehicule.marque,
    modele: vehicule.modele,
    type_carburant: vehicule.type_carburant,
    statut: vehicule.statut,
    kilometrage_actuel: Number(vehicule.kilometrage_actuel) || 0,
    nb_trajets,
    km_parcourus,
    conso_moyenne,
    cout_carburant_total,
    cout_total,
  };
}

/**
 * Récupère la comparaison entre plusieurs véhicules
 */
export async function getVehiculesComparison(
  vehiculeIds: string[],
  options?: {
    dateDebut?: string;
    dateFin?: string;
  }
) {
  const stats = await Promise.all(
    vehiculeIds.map((id) => getVehiculeStats(id, options))
  );

  return stats.sort((a, b) => a.conso_moyenne - b.conso_moyenne);
}

/**
 * Récupère les véhicules les plus économes
 */
export async function getVehiculesEconomes(limit = 10) {
  const supabase = await createClient();

  const { data: trajets } = await supabase
    .from("trajet")
    .select(`
      vehicule_id,
      consommation_au_100,
      vehicule:vehicule(immatriculation, marque, modele, type_carburant, statut)
    `)
    .not("consommation_au_100", "is", null);

  if (!trajets) return [];

  // Calculer conso moyenne par véhicule
  const statsMap = new Map<
    string,
    {
      vehicule: {
        immatriculation: string;
        marque: string | null;
        modele: string | null;
        type_carburant: string | null;
        statut: string;
      };
      total_conso: number;
      count: number;
    }
  >();

  trajets.forEach((trajet) => {
    if (!trajet.vehicule) return;

    const vehiculeId = trajet.vehicule_id;
    const conso = Number(trajet.consommation_au_100) || 0;

    if (!statsMap.has(vehiculeId)) {
      statsMap.set(vehiculeId, {
        vehicule: trajet.vehicule as unknown as {
          immatriculation: string;
          marque: string | null;
          modele: string | null;
          type_carburant: string | null;
          statut: string;
        },
        total_conso: 0,
        count: 0,
      });
    }

    const stats = statsMap.get(vehiculeId)!;
    stats.total_conso += conso;
    stats.count += 1;
  });

  // Convertir en array et calculer moyenne
  return Array.from(statsMap.values())
    .filter((item) => item.count >= 3) // Minimum 3 trajets
    .map((item) => ({
      ...item.vehicule,
      conso_moyenne: item.total_conso / item.count,
      nb_trajets: item.count,
    }))
    .sort((a, b) => a.conso_moyenne - b.conso_moyenne)
    .slice(0, limit)
    .map((item, index) => ({
      rang: index + 1,
      ...item,
    }));
}

/**
 * Récupère les véhicules avec consommation problématique
 */
export async function getVehiculesProblematiques(limit = 10) {
  const supabase = await createClient();

  const { data: trajets } = await supabase
    .from("trajet")
    .select(`
      vehicule_id,
      consommation_au_100,
      vehicule:vehicule(immatriculation, marque, modele, type_carburant, statut)
    `)
    .not("consommation_au_100", "is", null);

  if (!trajets) return [];

  // Calculer conso moyenne par véhicule
  const statsMap = new Map<
    string,
    {
      vehicule: {
        immatriculation: string;
        marque: string | null;
        modele: string | null;
        type_carburant: string | null;
        statut: string;
      };
      total_conso: number;
      count: number;
    }
  >();

  trajets.forEach((trajet) => {
    if (!trajet.vehicule) return;

    const vehiculeId = trajet.vehicule_id;
    const conso = Number(trajet.consommation_au_100) || 0;

    if (!statsMap.has(vehiculeId)) {
      statsMap.set(vehiculeId, {
        vehicule: trajet.vehicule as unknown as {
          immatriculation: string;
          marque: string | null;
          modele: string | null;
          type_carburant: string | null;
          statut: string;
        },
        total_conso: 0,
        count: 0,
      });
    }

    const stats = statsMap.get(vehiculeId)!;
    stats.total_conso += conso;
    stats.count += 1;
  });

  // Convertir en array et calculer moyenne
  return Array.from(statsMap.values())
    .filter((item) => item.count >= 3) // Minimum 3 trajets
    .map((item) => ({
      ...item.vehicule,
      conso_moyenne: item.total_conso / item.count,
      nb_trajets: item.count,
    }))
    .sort((a, b) => b.conso_moyenne - a.conso_moyenne) // Plus gourmands en premier
    .slice(0, limit)
    .map((item, index) => ({
      rang: index + 1,
      ...item,
    }));
}

/**
 * Récupère l'évolution mensuelle des performances d'un véhicule
 */
export async function getVehiculePerformanceEvolution(
  vehiculeId: string,
  mois = 12
) {
  const supabase = await createClient();

  const dateDebut = new Date();
  dateDebut.setMonth(dateDebut.getMonth() - mois);

  const { data: trajets } = await supabase
    .from("trajet")
    .select("date_trajet, parcours_total, consommation_au_100, prix_litre")
    .eq("vehicule_id", vehiculeId)
    .gte("date_trajet", dateDebut.toISOString().split("T")[0])
    .order("date_trajet");

  if (!trajets || trajets.length === 0) return [];

  // Regrouper par mois
  const monthlyData = new Map<string, {
    nb_trajets: number;
    km_total: number;
    conso_total: number;
    conso_count: number;
    cout_total: number;
  }>();

  trajets.forEach((trajet) => {
    const monthKey = trajet.date_trajet.substring(0, 7); // YYYY-MM

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, {
        nb_trajets: 0,
        km_total: 0,
        conso_total: 0,
        conso_count: 0,
        cout_total: 0,
      });
    }

    const data = monthlyData.get(monthKey)!;
    data.nb_trajets += 1;
    data.km_total += Number(trajet.parcours_total) || 0;
    data.cout_total += Number(trajet.prix_litre) || 0;

    if (trajet.consommation_au_100) {
      data.conso_total += Number(trajet.consommation_au_100);
      data.conso_count += 1;
    }
  });

  // Convertir en array
  return Array.from(monthlyData.entries())
    .map(([mois, data]) => ({
      mois,
      nb_trajets: data.nb_trajets,
      km_total: data.km_total,
      conso_moyenne: data.conso_count > 0 ? data.conso_total / data.conso_count : 0,
      cout_total: data.cout_total,
    }))
    .sort((a, b) => a.mois.localeCompare(b.mois));
}

/**
 * Génère des alertes maintenance pour un véhicule
 */
export async function getVehiculeAlertesMaintenance(vehiculeId: string) {
  const supabase = await createClient();

  const { data: vehicule } = await supabase
    .from("vehicule")
    .select("*, trajets:trajet(consommation_au_100, ecart_litrage)")
    .eq("id", vehiculeId)
    .single();

  if (!vehicule) return [];

  const alertes: Array<{ type: string; message: string; severite: "info" | "warning" | "error" }> = [];

  // Alerte kilométrage élevé
  const kmActuel = Number(vehicule.kilometrage_actuel) || 0;
  if (kmActuel > 500000) {
    alertes.push({
      type: "kilometrage",
      message: `Kilométrage élevé (${kmActuel.toLocaleString("fr-FR")} km) - Révision majeure recommandée`,
      severite: "warning",
    });
  }

  // Alerte consommation anormale (basé sur les 10 derniers trajets)
  type TrajetWithConso = { consommation_au_100: number | null; ecart_litrage: number | null };
  const trajetsRecents = (vehicule.trajets?.slice(0, 10) || []) as TrajetWithConso[];
  if (trajetsRecents.length >= 5) {
    const consoMoyenne =
      trajetsRecents.reduce(
        (sum: number, t: TrajetWithConso) => sum + (Number(t.consommation_au_100) || 0),
        0
      ) / trajetsRecents.length;

    // Si un trajet récent a +30% de conso
    const hasConsoAbnormale = trajetsRecents.some((t: TrajetWithConso) => {
      const conso = Number(t.consommation_au_100) || 0;
      return conso > consoMoyenne * 1.3;
    });

    if (hasConsoAbnormale) {
      alertes.push({
        type: "consommation",
        message: "Consommation anormale détectée - Vérifier le moteur et les filtres",
        severite: "error",
      });
    }
  }

  // Alerte écart litrage important
  const hasEcartImportant = trajetsRecents.some((t: TrajetWithConso) => {
    const ecart = Math.abs(Number(t.ecart_litrage) || 0);
    return ecart > 10;
  });

  if (hasEcartImportant) {
    alertes.push({
      type: "litrage",
      message: "Écarts de litrage importants détectés - Vérifier le réservoir",
      severite: "warning",
    });
  }

  return alertes;
}
