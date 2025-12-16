/**
 * Page de détails d'un chauffeur
 */

import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChauffeurDetails } from "@/components/chauffeurs/chauffeur-details";
import { ChauffeurCreateTripButton } from "@/components/chauffeurs/chauffeur-create-trip-button";

interface ChauffeurPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChauffeurPage({ params }: ChauffeurPageProps) {
  const { id } = await params;

  return (
    <div className="container py-6 space-y-6">
      {/* Navigation et actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/chauffeurs">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Chauffeur</h1>
            <p className="text-muted-foreground">Détails et statistiques</p>
          </div>
        </div>

        <div className="flex gap-2">
          <ChauffeurCreateTripButton chauffeurId={id} />
          <Button variant="outline" asChild>
            <Link href={`/chauffeurs/${id}/modifier`}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
        </div>
      </div>

      {/* Détails */}
      <ChauffeurDetails chauffeurId={id} />
    </div>
  );
}
