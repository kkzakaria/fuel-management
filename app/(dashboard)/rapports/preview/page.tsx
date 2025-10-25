/**
 * Page: Report Preview
 *
 * Preview and export reports
 */

"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportSummary } from "@/components/reports/report-summary";
import { FleetPerformance } from "@/components/reports/fleet-performance";
import { FinancialAnalysis } from "@/components/reports/financial-analysis";
import { useReportData } from "@/hooks/use-report-data";
import { ArrowLeft, FileText, Table2 } from "lucide-react";
import { toast } from "sonner";
import type { ReportType } from "@/lib/report-types";
import type { MonthlyReport } from "@/lib/report-types";

function ReportPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { report, isLoading, error, loadReport } = useReportData();

  useEffect(() => {
    const loadReportData = async () => {
      const type = searchParams.get("type");
      const dateFrom = searchParams.get("dateFrom");
      const dateTo = searchParams.get("dateTo");
      const chauffeurId = searchParams.get("chauffeurId");
      const vehiculeId = searchParams.get("vehiculeId");
      const destinationId = searchParams.get("destinationId");

      if (!type || !dateFrom || !dateTo) {
        toast.error("Paramètres de rapport invalides");
        router.push("/rapports");
        return;
      }

      try {
        await loadReport({
          reportType: type as ReportType,
          dateFrom: new Date(dateFrom),
          dateTo: new Date(dateTo),
          chauffeurId: chauffeurId || undefined,
          vehiculeId: vehiculeId || undefined,
          destinationId: destinationId || undefined,
          includeGraphs: true,
          includeTables: true,
        });
      } catch (err) {
        console.error("Failed to load report:", err);
      }
    };

    loadReportData();
  }, [searchParams, loadReport, router]);

  const handleExportPDF = async () => {
    try {
      toast.info("Export PDF en cours...");

      // Dynamic import to avoid bundling issues
      const { generatePDF } = await import("@/lib/export/pdf-generator");

      if (!report) {
        toast.error("Aucun rapport à exporter");
        return;
      }

      await generatePDF(report);
      toast.success("Rapport PDF généré avec succès");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Échec de l'export PDF");
    }
  };

  const handleExportExcel = async () => {
    try {
      toast.info("Export Excel en cours...");

      // Dynamic import
      const { generateExcel } = await import("@/lib/export/excel-generator");

      if (!report) {
        toast.error("Aucun rapport à exporter");
        return;
      }

      await generateExcel(report);
      toast.success("Rapport Excel généré avec succès");
    } catch (err) {
      console.error("Excel export error:", err);
      toast.error("Échec de l'export Excel");
    }
  };

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="p-6">
          <p className="text-destructive">{error}</p>
          <Button
            onClick={() => router.push("/rapports")}
            variant="outline"
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux rapports
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!report) {
    return null;
  }

  // Currently only supporting monthly reports in preview
  const monthlyReport = report as MonthlyReport;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/rapports")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline">
            <Table2 className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <Separator />

      {/* Report Content */}
      <div className="space-y-8">
        {/* Executive Summary */}
        {monthlyReport.executiveSummary && (
          <>
            <ReportSummary summary={monthlyReport.executiveSummary} />
            <Separator />
          </>
        )}

        {/* Fleet Performance */}
        {monthlyReport.fleetPerformance && (
          <>
            <FleetPerformance performance={monthlyReport.fleetPerformance} />
            <Separator />
          </>
        )}

        {/* Financial Analysis */}
        {monthlyReport.financialAnalysis && (
          <FinancialAnalysis analysis={monthlyReport.financialAnalysis} />
        )}
      </div>
    </div>
  );
}

export default function ReportPreviewPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <ReportPreviewContent />
    </Suspense>
  );
}
