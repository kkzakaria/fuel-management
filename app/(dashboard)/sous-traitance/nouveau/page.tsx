/**
 * Page: Nouveau sous-traitant
 * Route: /sous-traitance/nouveau
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SousTraitantForm } from "@/components/sous-traitants/sous-traitant-form";

export default function NouveauSousTraitantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouveau sous-traitant</h1>
        <p className="text-muted-foreground">
          Ajouter un nouveau partenaire de transport
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du sous-traitant</CardTitle>
          <CardDescription>
            Renseignez les coordonnées de l&apos;entreprise partenaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SousTraitantForm />
        </CardContent>
      </Card>
    </div>
  );
}
