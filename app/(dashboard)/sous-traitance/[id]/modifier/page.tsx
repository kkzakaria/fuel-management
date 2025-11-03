/**
 * Page: Modifier sous-traitant
 * Route: /sous-traitance/[id]/modifier
 */

"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SousTraitantForm } from "@/components/sous-traitants/sous-traitant-form";
import { useSousTraitant } from "@/hooks/use-sous-traitant";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ModifierSousTraitantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { sousTraitant, loading, error } = useSousTraitant(id);

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading || !sousTraitant) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/sous-traitance/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Modifier {sousTraitant.nom_entreprise}
          </h1>
          <p className="text-muted-foreground">
            Mettre à jour les informations du sous-traitant
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du sous-traitant</CardTitle>
          <CardDescription>
            Modifiez les coordonnées de l&apos;entreprise partenaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SousTraitantForm sousTraitant={sousTraitant} />
        </CardContent>
      </Card>
    </div>
  );
}
