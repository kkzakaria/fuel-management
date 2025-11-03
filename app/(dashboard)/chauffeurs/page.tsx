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
import { ChauffeurListItem } from "@/components/chauffeurs/chauffeur-list-item";
import { ChauffeurFilters } from "@/components/chauffeurs/chauffeur-filters";
import { useChauffeurs } from "@/hooks/use-chauffeurs";
import { useUserRole } from "@/hooks/use-user-role";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="container py-4 space-y-4 sm:py-6 sm:space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold sm:text-3xl">Chauffeurs</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
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

      {/* Table (Desktop) */}
      <div className="hidden md:block">
        <ChauffeurTable chauffeurs={chauffeurs} loading={loading} />
      </div>

      {/* Liste (Mobile) */}
      <div className="md:hidden">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : chauffeurs.length === 0 ? (
          <div className="rounded-md border p-8 text-center">
            <p className="text-muted-foreground">Aucun chauffeur trouvé</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            {chauffeurs.map((chauffeur) => (
              <ChauffeurListItem key={chauffeur.id} chauffeur={chauffeur} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
