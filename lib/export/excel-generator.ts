/**
 * Excel Generator
 *
 * Generate Excel reports using xlsx
 */

import * as XLSX from "xlsx";
import type { Report, MonthlyReport } from "../report-types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export async function generateExcel(report: Report): Promise<void> {
  const workbook = XLSX.utils.book_new();

  // Handle different report types
  if (report.type === "monthly") {
    generateMonthlyExcel(workbook, report as MonthlyReport);
  } else {
    // Placeholder for other report types
    const ws = XLSX.utils.aoa_to_sheet([
      ["Type de rapport", report.type],
      ["Note", "Ce type de rapport sera implémenté dans une version future"],
    ]);
    XLSX.utils.book_append_sheet(workbook, ws, "Rapport");
  }

  // Generate filename
  const filename = `rapport_${report.type}_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`;

  // Write file
  XLSX.writeFile(workbook, filename);
}

function generateMonthlyExcel(
  workbook: XLSX.WorkBook,
  report: MonthlyReport,
): void {
  // Sheet 1: Résumé Exécutif
  const summaryData = [
    ["RÉSUMÉ EXÉCUTIF"],
    [""],
    ["Période", report.executiveSummary.period.label],
    ["Généré le", format(new Date(), "d MMMM yyyy 'à' HH:mm", { locale: fr })],
    [""],
    ["INDICATEURS CLÉS"],
    ["Indicateur", "Valeur", "Évolution (%)"],
    [
      "Trajets effectués",
      report.executiveSummary.kpis.totalTrips,
      report.executiveSummary.kpis.tripsChange,
    ],
    [
      "Conteneurs livrés",
      report.executiveSummary.kpis.totalContainers,
      report.executiveSummary.kpis.containersChange,
    ],
    [
      "Coût total (XOF)",
      report.executiveSummary.kpis.totalCost,
      report.executiveSummary.kpis.costChange,
    ],
    [
      "Coût carburant (XOF)",
      report.executiveSummary.kpis.totalFuelCost,
      report.executiveSummary.kpis.fuelCostChange,
    ],
    [
      "Consommation moyenne (L/100km)",
      report.executiveSummary.kpis.averageConsumption,
      "",
    ],
    [
      "Alertes actives",
      report.executiveSummary.kpis.activeAlerts,
      "",
    ],
  ];

  if (report.executiveSummary.highlights.length > 0) {
    summaryData.push([""], ["POINTS CLÉS"]);
    report.executiveSummary.highlights.forEach((highlight) => {
      summaryData.push([highlight]);
    });
  }

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

  // Set column widths
  wsSummary["!cols"] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 15 },
  ];

  // Add styling (Excel will interpret these)
  wsSummary["A1"] = { v: "RÉSUMÉ EXÉCUTIF", t: "s", s: { font: { bold: true, sz: 16 } } };
  wsSummary["A6"] = { v: "INDICATEURS CLÉS", t: "s", s: { font: { bold: true } } };

  XLSX.utils.book_append_sheet(workbook, wsSummary, "Résumé");

  // Sheet 2: Performance Flotte
  const fleetData = [
    ["PERFORMANCE DE LA FLOTTE"],
    [""],
    ["TOP 5 CHAUFFEURS"],
    ["Rang", "Prénom", "Nom", "Trajets", "Km Total", "Consommation (L/100km)", "Coût Total (XOF)", "Score"],
  ];

  report.fleetPerformance.topDrivers.forEach((driver, index) => {
    fleetData.push([
      (index + 1).toString(),
      driver.prenom,
      driver.nom,
      driver.totalTrips.toString(),
      driver.totalKm.toString(),
      driver.averageConsumption.toFixed(2),
      driver.totalCost.toString(),
      driver.efficiency.toString(),
    ]);
  });

  fleetData.push([""], ["TOP 5 VÉHICULES"]);
  fleetData.push([
    "Rang",
    "Immatriculation",
    "Marque",
    "Modèle",
    "Trajets",
    "Km Total",
    "Consommation (L/100km)",
    "Coût Carburant (XOF)",
    "Score",
  ]);

  report.fleetPerformance.topVehicles.forEach((vehicle, index) => {
    fleetData.push([
      (index + 1).toString(),
      vehicle.immatriculation,
      vehicle.marque,
      vehicle.modele,
      vehicle.totalTrips.toString(),
      vehicle.totalKm.toString(),
      vehicle.averageConsumption.toFixed(2),
      vehicle.totalFuelCost.toString(),
      vehicle.efficiency.toString(),
    ]);
  });

  const wsFleet = XLSX.utils.aoa_to_sheet(fleetData);

  wsFleet["!cols"] = [
    { wch: 8 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 12 },
    { wch: 20 },
    { wch: 18 },
    { wch: 8 },
  ];

  XLSX.utils.book_append_sheet(workbook, wsFleet, "Performance Flotte");

  // Sheet 3: Analyse Financière
  const financialData = [
    ["ANALYSE FINANCIÈRE"],
    [""],
    ["RÉPARTITION DES COÛTS"],
    ["Catégorie", "Montant (XOF)", "Pourcentage (%)"],
  ];

  report.financialAnalysis.costsByCategory.forEach((cat) => {
    financialData.push([cat.category, cat.amount.toString(), cat.percentage.toFixed(2)]);
  });

  financialData.push([
    "TOTAL",
    report.financialAnalysis.totalCosts.total.toString(),
    "100",
  ]);

  financialData.push([""], ["MOYENNES"]);
  financialData.push([
    "Prix litre carburant (XOF)",
    report.financialAnalysis.averages.fuelPricePerLiter.toFixed(2),
  ]);
  financialData.push([
    "Coût par km (XOF)",
    report.financialAnalysis.averages.costPerKm.toFixed(2),
  ]);
  financialData.push([
    "Coût par trajet (XOF)",
    report.financialAnalysis.averages.costPerTrip.toFixed(2),
  ]);
  financialData.push([
    "Coût par conteneur (XOF)",
    report.financialAnalysis.averages.costPerContainer.toFixed(2),
  ]);

  if (report.financialAnalysis.costsByDestination.length > 0) {
    financialData.push([""], ["TOP 10 DESTINATIONS PAR COÛT"]);
    financialData.push([
      "Destination",
      "Trajets",
      "Conteneurs",
      "Coût Total (XOF)",
      "Coût Moyen (XOF)",
    ]);

    report.financialAnalysis.costsByDestination.forEach((dest) => {
      financialData.push([
        dest.destination,
        dest.trips.toString(),
        dest.containers.toString(),
        dest.totalCost.toString(),
        dest.averageCost.toFixed(2),
      ]);
    });
  }

  const wsFinancial = XLSX.utils.aoa_to_sheet(financialData);

  wsFinancial["!cols"] = [
    { wch: 30 },
    { wch: 18 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(workbook, wsFinancial, "Analyse Financière");

  // Sheet 4: Détails Trajets (if available)
  if (report.detailedTrips && report.detailedTrips.length > 0) {
    const tripsData = [
      ["DÉTAILS DES TRAJETS"],
      [""],
      [
        "N° Trajet",
        "Date",
        "Chauffeur",
        "Véhicule",
        "Départ",
        "Destination",
        "Km",
        "Conteneurs",
        "Carburant (L)",
        "Consommation (L/100km)",
        "Coût Carburant (XOF)",
        "Coût Total (XOF)",
        "Statut",
        "Alertes",
      ],
    ];

    report.detailedTrips.forEach((trip) => {
      tripsData.push([
        trip.numero_trajet,
        format(trip.date, "d MMM yyyy", { locale: fr }),
        trip.chauffeur,
        trip.vehicule,
        trip.depart,
        trip.destination,
        trip.km.toString(),
        trip.containers.toString(),
        trip.fuelLiters.toFixed(2),
        trip.consumption.toFixed(2),
        trip.fuelCost.toString(),
        trip.totalCost.toString(),
        trip.status,
        trip.alerts?.join(", ") || "",
      ]);
    });

    const wsTrips = XLSX.utils.aoa_to_sheet(tripsData);

    wsTrips["!cols"] = [
      { wch: 15 }, // N° Trajet
      { wch: 12 }, // Date
      { wch: 20 }, // Chauffeur
      { wch: 15 }, // Véhicule
      { wch: 15 }, // Départ
      { wch: 15 }, // Destination
      { wch: 8 },  // Km
      { wch: 12 }, // Conteneurs
      { wch: 12 }, // Carburant
      { wch: 20 }, // Consommation
      { wch: 18 }, // Coût Carburant
      { wch: 18 }, // Coût Total
      { wch: 12 }, // Statut
      { wch: 30 }, // Alertes
    ];

    XLSX.utils.book_append_sheet(workbook, wsTrips, "Détails Trajets");
  }
}
