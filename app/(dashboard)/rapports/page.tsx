/**
 * Page: Rapports
 *
 * Main reports page with type selection and filters
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReportTypeSelector } from "@/components/reports/report-type-selector";
import { ReportFilters, type ReportFiltersState } from "@/components/reports/report-filters";
import { getPresetDateRange } from "@/lib/date-utils";
import { FileText } from "lucide-react";

export default function RapportsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ReportFiltersState>(() => {
    const range = getPresetDateRange("month");
    return {
      reportType: null,
      dateFrom: range.from,
      dateTo: range.to,
    };
  });

  const handleGenerateReport = () => {
    if (!filters.reportType) return;

    // Encode filters for URL
    const params = new URLSearchParams({
      type: filters.reportType,
      dateFrom: filters.dateFrom.toISOString(),
      dateTo: filters.dateTo.toISOString(),
    });

    if (filters.chauffeurId) params.set("chauffeurId", filters.chauffeurId);
    if (filters.vehiculeId) params.set("vehiculeId", filters.vehiculeId);
    if (filters.destinationId) params.set("destinationId", filters.destinationId);

    // Navigate to preview page
    router.push(`/rapports/preview?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports</h1>
          <p className="text-muted-foreground">
            Générez des rapports détaillés avec graphiques et tableaux
          </p>
        </div>
      </div>

      <Separator />

      {/* Report Type Selection */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Type de rapport</h2>
          <p className="text-sm text-muted-foreground">
            Sélectionnez le type de rapport que vous souhaitez générer
          </p>
        </div>

        <ReportTypeSelector
          selectedType={filters.reportType}
          onSelectType={(type) => setFilters({ ...filters, reportType: type })}
        />
      </div>

      {/* Filters (shown when type is selected) */}
      {filters.reportType && (
        <>
          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
              <CardDescription>
                Configurez la période et les critères de filtrage pour votre
                rapport
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportFilters
                filters={filters}
                onFiltersChange={setFilters}
                onGenerate={handleGenerateReport}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
