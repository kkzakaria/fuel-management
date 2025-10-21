/**
 * Page de création d'un nouveau véhicule
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VehiculeForm } from "@/components/vehicules/vehicule-form";

export default function NouveauVehiculePage() {
  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Nouveau véhicule</CardTitle>
        </CardHeader>
        <CardContent>
          <VehiculeForm />
        </CardContent>
      </Card>
    </div>
  );
}
