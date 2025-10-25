/**
 * PDF Generator
 *
 * Generate PDF reports using jsPDF and jspdf-autotable
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Report, MonthlyReport } from "../report-types";
import { formatCurrency, formatConsumption, formatPercentage } from "../format-utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Extend jsPDF type to include autoTable properties
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export async function generatePDF(report: Report): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set font
  doc.setFont("helvetica");

  // Add metadata
  doc.setProperties({
    title: `Rapport ${report.type}`,
    subject: "Transport Manager Report",
    author: "Transport Manager",
    keywords: "transport, rapport, flotte",
    creator: "Transport Manager PWA",
  });

  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 139);
  doc.text("RAPPORT DE GESTION", 105, yPos, { align: "center" });
  yPos += 10;

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(
    `Généré le ${format(new Date(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}`,
    105,
    yPos,
    { align: "center" },
  );
  yPos += 15;

  // Handle different report types
  if (report.type === "monthly") {
    await generateMonthlyPDF(doc, report as MonthlyReport, yPos);
  } else {
    // Placeholder for other report types
    doc.setFontSize(12);
    doc.text(
      `Type de rapport: ${report.type}`,
      20,
      yPos,
    );
    doc.text(
      "Ce type de rapport sera implémenté dans une version future.",
      20,
      yPos + 10,
    );
  }

  // Save PDF
  const filename = `rapport_${report.type}_${format(new Date(), "yyyy-MM-dd_HHmm")}.pdf`;
  doc.save(filename);
}

async function generateMonthlyPDF(
  doc: jsPDF,
  report: MonthlyReport,
  startY: number,
): Promise<void> {
  let yPos = startY;

  // Period
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Période", 20, yPos);
  yPos += 7;

  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text(report.executiveSummary.period.label, 20, yPos);
  yPos += 12;

  // Executive Summary
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("RÉSUMÉ EXÉCUTIF", 20, yPos);
  yPos += 10;

  // KPIs Table
  autoTable(doc, {
    startY: yPos,
    head: [["Indicateur", "Valeur", "Évolution"]],
    body: [
      [
        "Trajets effectués",
        report.executiveSummary.kpis.totalTrips.toString(),
        `${report.executiveSummary.kpis.tripsChange > 0 ? "+" : ""}${report.executiveSummary.kpis.tripsChange.toFixed(1)}%`,
      ],
      [
        "Conteneurs livrés",
        report.executiveSummary.kpis.totalContainers.toString(),
        `${report.executiveSummary.kpis.containersChange > 0 ? "+" : ""}${report.executiveSummary.kpis.containersChange.toFixed(1)}%`,
      ],
      [
        "Coût total",
        formatCurrency(report.executiveSummary.kpis.totalCost),
        `${report.executiveSummary.kpis.costChange > 0 ? "+" : ""}${report.executiveSummary.kpis.costChange.toFixed(1)}%`,
      ],
      [
        "Coût carburant",
        formatCurrency(report.executiveSummary.kpis.totalFuelCost),
        `${report.executiveSummary.kpis.fuelCostChange > 0 ? "+" : ""}${report.executiveSummary.kpis.fuelCostChange.toFixed(1)}%`,
      ],
      [
        "Consommation moyenne",
        formatConsumption(report.executiveSummary.kpis.averageConsumption),
        report.executiveSummary.kpis.consumptionTrend === "up"
          ? "En hausse"
          : report.executiveSummary.kpis.consumptionTrend === "down"
            ? "En baisse"
            : "Stable",
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [0, 0, 139], textColor: 255 },
    styles: { fontSize: 10 },
  });

  yPos = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 10;

  // Highlights
  if (report.executiveSummary.highlights.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Points clés", 20, yPos);
    yPos += 7;

    doc.setFontSize(10);
    report.executiveSummary.highlights.forEach((highlight) => {
      doc.text(`• ${highlight}`, 25, yPos);
      yPos += 6;
    });

    yPos += 5;
  }

  // New page for Fleet Performance
  doc.addPage();
  yPos = 20;

  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("PERFORMANCE DE LA FLOTTE", 20, yPos);
  yPos += 10;

  // Top Drivers
  doc.setFontSize(14);
  doc.text("Top 5 Chauffeurs", 20, yPos);
  yPos += 7;

  autoTable(doc, {
    startY: yPos,
    head: [["Rang", "Chauffeur", "Trajets", "Consommation", "Coût Total", "Score"]],
    body: report.fleetPerformance.topDrivers.map((driver, index) => [
      `#${index + 1}`,
      `${driver.prenom} ${driver.nom}`,
      driver.totalTrips.toString(),
      formatConsumption(driver.averageConsumption),
      formatCurrency(driver.totalCost),
      `${driver.efficiency}/100`,
    ]),
    theme: "striped",
    headStyles: { fillColor: [34, 139, 34], textColor: 255 },
    styles: { fontSize: 9 },
  });

  yPos = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 10;

  // Top Vehicles
  doc.setFontSize(14);
  doc.text("Top 5 Véhicules", 20, yPos);
  yPos += 7;

  autoTable(doc, {
    startY: yPos,
    head: [["Rang", "Véhicule", "Trajets", "Consommation", "Coût Carburant", "Score"]],
    body: report.fleetPerformance.topVehicles.map((vehicle, index) => [
      `#${index + 1}`,
      vehicle.immatriculation,
      vehicle.totalTrips.toString(),
      formatConsumption(vehicle.averageConsumption),
      formatCurrency(vehicle.totalFuelCost),
      `${vehicle.efficiency}/100`,
    ]),
    theme: "striped",
    headStyles: { fillColor: [34, 139, 34], textColor: 255 },
    styles: { fontSize: 9 },
  });

  // New page for Financial Analysis
  doc.addPage();
  yPos = 20;

  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("ANALYSE FINANCIÈRE", 20, yPos);
  yPos += 10;

  // Costs Summary
  autoTable(doc, {
    startY: yPos,
    head: [["Catégorie", "Montant", "Pourcentage"]],
    body: report.financialAnalysis.costsByCategory.map((cat) => [
      cat.category,
      formatCurrency(cat.amount),
      formatPercentage(cat.percentage, 1),
    ]),
    theme: "striped",
    headStyles: { fillColor: [220, 20, 60], textColor: 255 },
    styles: { fontSize: 10 },
    foot: [
      [
        "TOTAL",
        formatCurrency(report.financialAnalysis.totalCosts.total),
        "100%",
      ],
    ],
    footStyles: { fillColor: [240, 240, 240], fontStyle: "bold" },
  });

  yPos = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 10;

  // Averages
  doc.setFontSize(14);
  doc.text("Moyennes", 20, yPos);
  yPos += 7;

  autoTable(doc, {
    startY: yPos,
    body: [
      [
        "Prix litre carburant",
        formatCurrency(report.financialAnalysis.averages.fuelPricePerLiter),
      ],
      [
        "Coût par km",
        formatCurrency(report.financialAnalysis.averages.costPerKm),
      ],
      [
        "Coût par trajet",
        formatCurrency(report.financialAnalysis.averages.costPerTrip),
      ],
      [
        "Coût par conteneur",
        formatCurrency(report.financialAnalysis.averages.costPerContainer),
      ],
    ],
    theme: "plain",
    styles: { fontSize: 10 },
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      105,
      290,
      { align: "center" },
    );
    doc.text(
      "Transport Manager - Rapport confidentiel",
      105,
      295,
      { align: "center" },
    );
  }
}
