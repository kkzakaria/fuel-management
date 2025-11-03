/**
 * Page: Détails sous-traitant
 * Route: /sous-traitance/[id]
 */

"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSousTraitant } from "@/hooks/use-sous-traitant";
import { useSousTraitantStats } from "@/hooks/use-sous-traitant-stats";
import { formatCurrency } from "@/lib/format-utils";
import { formatDate } from "@/lib/date-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function SousTraitantDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { sousTraitant, loading, error } = useSousTraitant(id);
  const { stats, loading: statsLoading } = useSousTraitantStats(id);

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

  const getStatutBadge = (statut: string | null) => {
    if (statut === "actif") return <Badge>Actif</Badge>;
    if (statut === "blackliste") return <Badge variant="destructive">Blacklisté</Badge>;
    return <Badge variant="secondary">Inactif</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/sous-traitance">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{sousTraitant.nom_entreprise}</h1>
            {getStatutBadge(sousTraitant.statut)}
          </div>
          <p className="text-muted-foreground">
            {sousTraitant.contact_principal || "Partenaire de transport"}
          </p>
        </div>
        <Link href={`/sous-traitance/${id}/modifier`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total missions</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total_missions || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Montant payé</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats?.montant_paye || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Montant restant</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats?.montant_restant || 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informations */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sousTraitant.telephone && (
            <div>
              <div className="text-sm font-medium">Téléphone</div>
              <div className="text-sm text-muted-foreground">{sousTraitant.telephone}</div>
            </div>
          )}
          {sousTraitant.email && (
            <div>
              <div className="text-sm font-medium">Email</div>
              <div className="text-sm text-muted-foreground">{sousTraitant.email}</div>
            </div>
          )}
          {sousTraitant.adresse && (
            <div>
              <div className="text-sm font-medium">Adresse</div>
              <div className="text-sm text-muted-foreground">{sousTraitant.adresse}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Missions récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Missions récentes</CardTitle>
          <CardDescription>
            {sousTraitant.missions?.length || 0} mission(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sousTraitant.missions || sousTraitant.missions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune mission enregistrée
            </p>
          ) : (
            <div className="space-y-4">
              {sousTraitant.missions.slice(0, 5).map((mission) => (
                <div key={mission.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <div className="font-medium">
                      {mission.localite_depart?.nom} → {mission.localite_arrivee?.nom}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(new Date(mission.date_mission))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(mission.montant_total)}</div>
                    <Badge variant={mission.solde_paye ? "default" : "secondary"}>
                      {mission.solde_paye ? "Payé" : mission.avance_payee ? "Avance" : "En attente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
