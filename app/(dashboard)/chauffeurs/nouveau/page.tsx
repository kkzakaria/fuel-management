/**
 * Page de création d'un nouveau chauffeur
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChauffeurForm } from "@/components/chauffeurs/chauffeur-form";

export default function NouveauChauffeurPage() {
  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Nouveau chauffeur</CardTitle>
        </CardHeader>
        <CardContent>
          <ChauffeurForm />
        </CardContent>
      </Card>
    </div>
  );
}
