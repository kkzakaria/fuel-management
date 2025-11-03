/**
 * Page de liste des véhicules
 * Affiche les véhicules sous forme de cartes avec filtres
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VehiculeCard } from "@/components/vehicules/vehicule-card";
import { VehiculeListItem } from "@/components/vehicules/vehicule-list-item";
import { VehiculeFilters } from "@/components/vehicules/vehicule-filters";
import { useVehicules } from "@/hooks/use-vehicules";
import { useUserRole } from "@/hooks/use-user-role";

export default function VehiculesPage() {
  const { canManageVehicles } = useUserRole();
  const {
    vehicules,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    count,
    refresh,
  } = useVehicules({
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
          <h1 className="text-2xl font-bold sm:text-3xl">Véhicules</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Gestion de la flotte et maintenance
          </p>
        </div>
        {canManageVehicles && (
          <Button asChild>
            <Link href="/vehicules/nouveau">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau véhicule
            </Link>
          </Button>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total véhicules</p>
              <p className="text-3xl font-bold">{count}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Actifs</p>
              <p className="text-3xl font-bold">
                {vehicules.filter((v) => v.statut === "actif").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">En maintenance</p>
              <p className="text-3xl font-bold">
                {vehicules.filter((v) => v.statut === "maintenance").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <VehiculeFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
      />

      {/* Grille de cartes (Desktop) */}
      <div className="hidden md:block">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : vehicules.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center">
            <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Aucun véhicule</h3>
            <p className="text-sm text-muted-foreground">
              Commencez par ajouter un nouveau véhicule.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicules.map((vehicule) => (
              <VehiculeCard key={vehicule.id} vehicule={vehicule} />
            ))}
          </div>
        )}
      </div>

      {/* Liste (Mobile) */}
      <div className="md:hidden">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : vehicules.length === 0 ? (
          <div className="rounded-md border p-8 text-center">
            <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Aucun véhicule</h3>
            <p className="text-sm text-muted-foreground">
              Commencez par ajouter un nouveau véhicule.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            {vehicules.map((vehicule) => (
              <VehiculeListItem key={vehicule.id} vehicule={vehicule} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
