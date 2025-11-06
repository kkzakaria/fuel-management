/**
 * Page: Rapports
 *
 * Main reports page with type selection and filters
 * Migré vers Nuqs pour gestion automatique des filtres via URL
 */

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReportTypeSelector } from "@/components/reports/report-type-selector";
import { ReportFilters, type ReportFiltersState } from "@/components/reports/report-filters";
import { rapportSearchParams } from "@/lib/nuqs/parsers/rapport";
import { getPresetDateRange } from "@/lib/date-utils";
import { FileText } from "lucide-react";

export default function RapportsPage() {
  const router = useRouter();

  // Utilise Nuqs pour gérer les filtres via URL
  const [searchParams, setSearchParams] = useQueryStates(rapportSearchParams, {
    history: "push",
    shallow: true,
  });

  // Convertir searchParams en format ReportFiltersState pour compatibilité
  const filters: ReportFiltersState = useMemo(() => {
    const range = getPresetDateRange("month");
    return {
      reportType: searchParams.reportType,
      dateFrom: searchParams.dateFrom ? new Date(searchParams.dateFrom) : range.from,
      dateTo: searchParams.dateTo ? new Date(searchParams.dateTo) : range.to,
      chauffeurId: searchParams.chauffeurId ?? undefined,
      vehiculeId: searchParams.vehiculeId ?? undefined,
      destinationId: searchParams.destinationId ?? undefined,
    };
  }, [searchParams]);

  const handleGenerateReport = () => {
    if (!filters.reportType) return;

    // Les filtres sont déjà dans l'URL grâce à Nuqs
    // Il suffit de naviguer vers la page preview
    router.push("/rapports/preview");
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
          onSelectType={(type) => setSearchParams({ reportType: type })}
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
                onFiltersChange={(newFilters) => {
                  setSearchParams({
                    reportType: newFilters.reportType,
                    dateFrom: newFilters.dateFrom?.toISOString() ?? null,
                    dateTo: newFilters.dateTo?.toISOString() ?? null,
                    chauffeurId: newFilters.chauffeurId ?? null,
                    vehiculeId: newFilters.vehiculeId ?? null,
                    destinationId: newFilters.destinationId ?? null,
                  });
                }}
                onGenerate={handleGenerateReport}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
