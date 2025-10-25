/**
 * Report Validation Schemas
 *
 * Zod schemas for report filters and generation
 */

import { z } from "zod";

// =============================================================================
// Report Type Schema
// =============================================================================

export const reportTypeSchema = z.enum([
  "monthly",
  "driver",
  "vehicle",
  "destination",
  "financial",
]);

export const exportFormatSchema = z.enum(["pdf", "excel"]);

// =============================================================================
// Report Filters Schema
// =============================================================================

export const reportFiltersSchema = z
  .object({
    reportType: reportTypeSchema,
    dateFrom: z.date({
      required_error: "La date de début est requise",
      invalid_type_error: "Date invalide",
    }),
    dateTo: z.date({
      required_error: "La date de fin est requise",
      invalid_type_error: "Date invalide",
    }),
    chauffeurId: z.string().uuid().optional(),
    vehiculeId: z.string().uuid().optional(),
    destinationId: z.string().uuid().optional(),
    includeGraphs: z.boolean().default(true),
    includeTables: z.boolean().default(true),
  })
  .refine((data) => data.dateTo >= data.dateFrom, {
    message: "La date de fin doit être après la date de début",
    path: ["dateTo"],
  })
  .refine(
    (data) => {
      // Max 1 year range
      const diffTime = Math.abs(data.dateTo.getTime() - data.dateFrom.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 365;
    },
    {
      message: "La période ne peut pas dépasser 1 an",
      path: ["dateTo"],
    },
  )
  .refine(
    (data) => {
      // Driver report requires chauffeurId
      if (data.reportType === "driver" && !data.chauffeurId) {
        return false;
      }
      return true;
    },
    {
      message: "Un chauffeur doit être sélectionné pour ce type de rapport",
      path: ["chauffeurId"],
    },
  )
  .refine(
    (data) => {
      // Vehicle report requires vehiculeId
      if (data.reportType === "vehicle" && !data.vehiculeId) {
        return false;
      }
      return true;
    },
    {
      message: "Un véhicule doit être sélectionné pour ce type de rapport",
      path: ["vehiculeId"],
    },
  )
  .refine(
    (data) => {
      // Destination report requires destinationId
      if (data.reportType === "destination" && !data.destinationId) {
        return false;
      }
      return true;
    },
    {
      message: "Une destination doit être sélectionnée pour ce type de rapport",
      path: ["destinationId"],
    },
  );

// =============================================================================
// Export Request Schema
// =============================================================================

export const exportRequestSchema = z.object({
  filters: reportFiltersSchema,
  format: exportFormatSchema,
  includeGraphs: z.boolean().default(true),
  includeTables: z.boolean().default(true),
});

// =============================================================================
// Period Preset Schema
// =============================================================================

export const periodPresetSchema = z.enum([
  "today",
  "week",
  "month",
  "quarter",
  "year",
  "custom",
]);

export const customDateRangeSchema = z
  .object({
    from: z.date(),
    to: z.date(),
  })
  .refine((data) => data.to >= data.from, {
    message: "La date de fin doit être après la date de début",
  });

// =============================================================================
// Type Inference
// =============================================================================

export type ReportFiltersInput = z.infer<typeof reportFiltersSchema>;
export type ExportRequestInput = z.infer<typeof exportRequestSchema>;
export type PeriodPreset = z.infer<typeof periodPresetSchema>;
export type CustomDateRange = z.infer<typeof customDateRangeSchema>;
