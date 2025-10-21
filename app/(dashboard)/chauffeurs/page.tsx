/**
 * Page de liste des chauffeurs
 * Affiche la table avec filtres et pagination
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChauffeurTable } from "@/components/chauffeurs/chauffeur-table";
import { ChauffeurFilters } from "@/components/chauffeurs/chauffeur-filters";
import { useChauffeurs } from "@/hooks/use-chauffeurs";
import { useUserRole } from "@/hooks/use-user-role";

export default function ChauffeursPage() {
  const { canManageDrivers } = useUserRole();
  const {
    chauffeurs,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    count,
    refresh,
  } = useChauffeurs({
    pageSize: 20,
    autoRefresh: 60000, // Refresh every minute
  });

  // Rafraîchir quand on revient sur la page
  useEffect(() => {
    const handleFocus = () => {
      refresh();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refresh]);

  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-semibold">Erreur de chargement</p>
              <p className="text-sm">{error.message}</p>
              <Button onClick={refresh} variant="outline" className="mt-4">
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chauffeurs</h1>
          <p className="text-muted-foreground">
            Gestion des chauffeurs et performance
          </p>
        </div>
        {canManageDrivers && (
          <Button asChild>
            <Link href="/chauffeurs/nouveau">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau chauffeur
            </Link>
          </Button>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total chauffeurs</p>
              <p className="text-3xl font-bold">{count}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Sur cette page</p>
              <p className="text-3xl font-bold">{chauffeurs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Actifs</p>
              <p className="text-3xl font-bold">
                {chauffeurs.filter((c) => c.statut === "actif").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <ChauffeurFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
      />

      {/* Table */}
      <ChauffeurTable chauffeurs={chauffeurs} loading={loading} />
    </div>
  );
}
