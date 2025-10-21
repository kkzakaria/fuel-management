/**
 * Page de détails d'un véhicule
 */

import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehiculeDetails } from "@/components/vehicules/vehicule-details";

interface VehiculePageProps {
  params: Promise<{ id: string }>;
}

export default async function VehiculePage({ params }: VehiculePageProps) {
  const { id } = await params;

  return (
    <div className="container py-6 space-y-6">
      {/* Navigation et actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/vehicules">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Véhicule</h1>
            <p className="text-muted-foreground">Détails et statistiques</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/vehicules/${id}/modifier`}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
        </div>
      </div>

      {/* Détails */}
      <VehiculeDetails vehiculeId={id} />
    </div>
  );
}
