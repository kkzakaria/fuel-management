/**
 * Queries Supabase serveur pour statistiques chauffeurs
 *
 * Queries SQL optimisées pour calculer:
 * - Statistiques individuelles par chauffeur
 * - Classements (top conteneurs, top économes)
 * - Graphiques d'évolution
 */

import { createClient } from "./server";

export interface ChauffeurStats {
  chauffeur_id: string;
  nom: string;
  prenom: string;
  statut: string;
  nb_trajets: number;
  km_total: number;
  nb_conteneurs: number;
  conso_moyenne: number;
  cout_carburant_total: number;
  cout_frais_total: number;
}

/**
 * Récupère les statistiques complètes pour un chauffeur
 */
export async function getChauffeurStats(chauffeurId: string, options?: {
  dateDebut?: string;
  dateFin?: string;
}): Promise<ChauffeurStats> {
  const supabase = await createClient();

  // Query avec agrégations SQL
  const query = supabase
    .rpc("get_chauffeur_stats", {
      p_chauffeur_id: chauffeurId,
      p_date_debut: options?.dateDebut || null,
      p_date_fin: options?.dateFin || null,
    });

  const { data, error } = await query.single();

  if (error) {
    // Si la fonction RPC n'existe pas encore, utiliser requête manuelle
    return getChauffeurStatsManual(chauffeurId, options);
  }

  return data as ChauffeurStats;
}

/**
 * Version manuelle des stats (fallback si RPC n'existe pas)
 */
async function getChauffeurStatsManual(
  chauffeurId: string,
  options?: {
    dateDebut?: string;
    dateFin?: string;
  }
): Promise<ChauffeurStats> {
  const supabase = await createClient();

  // Récupérer le chauffeur
  const { data: chauffeur } = await supabase
    .from("chauffeur")
    .select("id, nom, prenom, statut")
    .eq("id", chauffeurId)
    .single();

  if (!chauffeur) {
    throw new Error("Chauffeur non trouvé");
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
      autres_frais,
      conteneurs:conteneur_trajet(quantite)
    `)
    .eq("chauffeur_id", chauffeurId);

  if (options?.dateDebut) {
    trajetQuery = trajetQuery.gte("date_trajet", options.dateDebut);
  }
  if (options?.dateFin) {
    trajetQuery = trajetQuery.lte("date_trajet", options.dateFin);
  }

  const { data: trajets } = await trajetQuery;

  // Calculer les stats
  const nb_trajets = trajets?.length || 0;
  const km_total = trajets?.reduce((sum, t) => sum + (Number(t.parcours_total) || 0), 0) || 0;
  const nb_conteneurs = trajets?.reduce((sum, t) => {
    return sum + (t.conteneurs?.reduce((s, c) => s + (Number(c.quantite) || 0), 0) || 0);
  }, 0) || 0;
  const conso_moyenne = nb_trajets > 0
    ? (trajets?.reduce((sum, t) => sum + (Number(t.consommation_au_100) || 0), 0) || 0) / nb_trajets
    : 0;
  const cout_carburant_total = trajets?.reduce((sum, t) => sum + (Number(t.prix_litre) || 0), 0) || 0;
  const cout_frais_total = trajets?.reduce((sum, t) =>
    sum + (Number(t.frais_peage) || 0) + (Number(t.autres_frais) || 0), 0
  ) || 0;

  return {
    chauffeur_id: chauffeur.id,
    nom: chauffeur.nom,
    prenom: chauffeur.prenom,
    statut: chauffeur.statut,
    nb_trajets,
    km_total,
    nb_conteneurs,
    conso_moyenne,
    cout_carburant_total,
    cout_frais_total,
  };
}

/**
 * Récupère le classement des chauffeurs (top conteneurs)
 */
export async function getChauffeurRankingConteneurs(limit = 10) {
  const supabase = await createClient();

  // Agrégation avec groupe et count
  const { data: trajets } = await supabase
    .from("trajet")
    .select(`
      chauffeur_id,
      chauffeur:chauffeur(nom, prenom, statut),
      conteneurs:conteneur_trajet(quantite)
    `);

  if (!trajets) return [];

  // Calculer nb conteneurs par chauffeur
  const statsMap = new Map<
    string,
    { chauffeur: { nom: string; prenom: string; statut: string }; nb_conteneurs: number }
  >();

  trajets.forEach((trajet) => {
    if (!trajet.chauffeur) return;

    const chauffeurId = trajet.chauffeur_id;
    const nbConteneurs = trajet.conteneurs?.reduce((sum, c) => sum + (Number(c.quantite) || 0), 0) || 0;

    if (!statsMap.has(chauffeurId)) {
      statsMap.set(chauffeurId, {
        chauffeur: trajet.chauffeur as unknown as { nom: string; prenom: string; statut: string },
        nb_conteneurs: 0,
      });
    }

    const stats = statsMap.get(chauffeurId)!;
    stats.nb_conteneurs += nbConteneurs;
  });

  // Convertir en array et trier
  return Array.from(statsMap.values())
    .sort((a, b) => b.nb_conteneurs - a.nb_conteneurs)
    .slice(0, limit)
    .map((item, index) => ({
      rang: index + 1,
      ...item.chauffeur,
      nb_conteneurs: item.nb_conteneurs,
    }));
}

/**
 * Récupère le classement des chauffeurs les plus économes
 */
export async function getChauffeurRankingEconomes(limit = 10) {
  const supabase = await createClient();

  const { data: trajets } = await supabase
    .from("trajet")
    .select(`
      chauffeur_id,
      consommation_au_100,
      chauffeur:chauffeur(nom, prenom, statut)
    `)
    .not("consommation_au_100", "is", null);

  if (!trajets) return [];

  // Calculer conso moyenne par chauffeur
  const statsMap = new Map<
    string,
    {
      chauffeur: { nom: string; prenom: string; statut: string };
      total_conso: number;
      count: number;
    }
  >();

  trajets.forEach((trajet) => {
    if (!trajet.chauffeur) return;

    const chauffeurId = trajet.chauffeur_id;
    const conso = Number(trajet.consommation_au_100) || 0;

    if (!statsMap.has(chauffeurId)) {
      statsMap.set(chauffeurId, {
        chauffeur: trajet.chauffeur as unknown as { nom: string; prenom: string; statut: string },
        total_conso: 0,
        count: 0,
      });
    }

    const stats = statsMap.get(chauffeurId)!;
    stats.total_conso += conso;
    stats.count += 1;
  });

  // Convertir en array et calculer moyenne
  return Array.from(statsMap.values())
    .filter((item) => item.count >= 3) // Minimum 3 trajets
    .map((item) => ({
      ...item.chauffeur,
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
 * Récupère l'évolution mensuelle des performances d'un chauffeur
 */
export async function getChauffeurPerformanceEvolution(
  chauffeurId: string,
  mois = 12
) {
  const supabase = await createClient();

  const dateDebut = new Date();
  dateDebut.setMonth(dateDebut.getMonth() - mois);

  const { data: trajets } = await supabase
    .from("trajet")
    .select("date_trajet, parcours_total, consommation_au_100, conteneurs:conteneur_trajet(quantite)")
    .eq("chauffeur_id", chauffeurId)
    .gte("date_trajet", dateDebut.toISOString().split("T")[0])
    .order("date_trajet");

  if (!trajets || trajets.length === 0) return [];

  // Regrouper par mois
  const monthlyData = new Map<string, {
    nb_trajets: number;
    km_total: number;
    nb_conteneurs: number;
    conso_total: number;
    conso_count: number;
  }>();

  trajets.forEach((trajet) => {
    const monthKey = trajet.date_trajet.substring(0, 7); // YYYY-MM

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, {
        nb_trajets: 0,
        km_total: 0,
        nb_conteneurs: 0,
        conso_total: 0,
        conso_count: 0,
      });
    }

    const data = monthlyData.get(monthKey)!;
    data.nb_trajets += 1;
    data.km_total += Number(trajet.parcours_total) || 0;
    data.nb_conteneurs += trajet.conteneurs?.reduce((sum, c) => sum + (Number(c.quantite) || 0), 0) || 0;

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
      nb_conteneurs: data.nb_conteneurs,
      conso_moyenne: data.conso_count > 0 ? data.conso_total / data.conso_count : 0,
    }))
    .sort((a, b) => a.mois.localeCompare(b.mois));
}
