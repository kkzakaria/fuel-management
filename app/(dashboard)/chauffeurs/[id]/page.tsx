/**
 * Page de détails d'un chauffeur
 * Design "Driver Command Profile" avec hero section intégrée
 */

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChauffeurDetails } from "@/components/chauffeurs/chauffeur-details";

interface ChauffeurPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChauffeurPage({ params }: ChauffeurPageProps) {
  const { id } = await params;

  return (
    <div className="container pt-0 pb-6 space-y-4">
      {/* Minimal navigation - buttons are now in ChauffeurDetails hero */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chauffeurs">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">Retour aux chauffeurs</span>
      </div>

      {/* Full details with integrated hero, tabs, and actions */}
      <ChauffeurDetails chauffeurId={id} />
    </div>
  );
}
