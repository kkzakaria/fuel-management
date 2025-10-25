/**
 * Report Type Selector Component
 *
 * Grid of cards to select report type
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  User,
  Truck,
  MapPin,
  DollarSign
} from "lucide-react";
import type { ReportType } from "@/lib/report-types";

interface ReportTypeSelectorProps {
  selectedType: ReportType | null;
  onSelectType: (type: ReportType) => void;
}

const reportTypes = [
  {
    type: "monthly" as ReportType,
    icon: FileText,
    title: "Rapport mensuel complet",
    description: "Vue d'ensemble complète : KPIs, performance flotte, analyse financière",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    type: "driver" as ReportType,
    icon: User,
    title: "Rapport par chauffeur",
    description: "Performance individuelle, statistiques et comparaison avec la moyenne",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    type: "vehicle" as ReportType,
    icon: Truck,
    title: "Rapport par véhicule",
    description: "Utilisation, consommation, maintenance et coûts d'exploitation",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    type: "destination" as ReportType,
    icon: MapPin,
    title: "Rapport par destination",
    description: "Fréquence des trajets, coûts moyens et conteneurs livrés par route",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    type: "financial" as ReportType,
    icon: DollarSign,
    title: "Rapport financier",
    description: "Dépenses par catégorie, évolution des coûts et prévisions",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

export function ReportTypeSelector({
  selectedType,
  onSelectType,
}: ReportTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reportTypes.map((report) => {
        const Icon = report.icon;
        const isSelected = selectedType === report.type;

        return (
          <Card
            key={report.type}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : ""
            }`}
            onClick={() => onSelectType(report.type)}
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className={`rounded-lg p-3 ${report.bgColor}`}>
                  <Icon className={`h-6 w-6 ${report.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {report.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
