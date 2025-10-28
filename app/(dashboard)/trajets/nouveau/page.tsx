/**
 * Page de création d'un nouveau trajet
 */

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrajetForm } from "@/components/trajets/trajet-form";

export default function NouveauTrajetPage() {
  return (
    <div className="container py-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/trajets">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nouveau trajet</h1>
          <p className="text-muted-foreground">
            Créer un nouveau trajet de livraison
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <TrajetForm />
    </div>
  );
}
