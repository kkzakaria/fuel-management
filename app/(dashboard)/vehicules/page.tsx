/**
 * Page de liste des véhicules
 * Affiche la table avec filtres et pagination via DataTable
 */

"use client";

import { useCallback, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { vehiculeColumns } from "@/components/vehicules/vehicule-columns";
import { VehiculeListItem } from "@/components/vehicules/vehicule-list-item";
import { VehiculeForm } from "@/components/vehicules/vehicule-form";
import { VehiculeFilters } from "@/components/vehicules/vehicule-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MobileFilterDrawer } from "@/components/ui/mobile-filter-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { useVehicules } from "@/hooks/use-vehicules";
import { useUserRole } from "@/hooks/use-user-role";
import type { Vehicule } from "@/lib/supabase/types";

export default function VehiculesPage() {
  const router = useRouter();
  const { canManageVehicles } = useUserRole();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { vehicules, loading, error, filters, updateFilters, clearFilters, refresh } = useVehicules({
    pageSize: 100, // DataTable gère la pagination en local
    autoRefresh: 60000, // Refresh every minute
  });

  // Handler pour la navigation vers les détails
  const handleRowClick = useCallback((vehicule: Vehicule) => {
    startTransition(() => {
      router.push(`/vehicules/${vehicule.id}`);
    });
  }, [router]);

  // Handler pour fermer le dialogue et rafraîchir les données
  const handleSuccess = useCallback(() => {
    setDialogOpen(false);
    refresh();
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
        {/* Bouton mobile/tablette uniquement */}
        {canManageVehicles && (
          <Button
            onClick={() => setDialogOpen(true)}
            size="sm"
            className="md:hidden"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Nouveau véhicule</span>
          </Button>
        )}
      </div>

      {/* Desktop: DataTable avec toutes les fonctionnalités */}
      <div className="hidden md:block">
        <DataTable
          columns={vehiculeColumns}
          data={vehicules}
          isLoading={loading}
          searchKey="immatriculation"
          searchPlaceholder="Rechercher un véhicule..."
          filterColumns={[
            {
              key: "statut",
              label: "Statut",
              options: [
                { label: "Actif", value: "actif" },
                { label: "Maintenance", value: "maintenance" },
                { label: "Inactif", value: "inactif" },
                { label: "Réformé", value: "reforme" },
              ],
            },
            {
              key: "type_carburant",
              label: "Carburant",
              options: [
                { label: "Diesel", value: "diesel" },
                { label: "Essence", value: "essence" },
                { label: "Hybride", value: "hybride" },
                { label: "Électrique", value: "electrique" },
              ],
            },
          ]}
          onRowClick={handleRowClick}
          pageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          stickyHeader
          addButton={{
            type: "dialog",
            onClick: () => setDialogOpen(true),
            label: "Nouveau véhicule",
            permission: canManageVehicles,
          }}
        />
      </div>

      {/* Mobile/Tablette: Vue en liste avec filtres */}
      <div className="md:hidden space-y-4">
        {/* Filtres mobile */}
        <MobileFilterDrawer
          activeFiltersCount={
            [filters.statut, filters.type_carburant, filters.search].filter(Boolean).length
          }
          onClearFilters={clearFilters}
          title="Filtrer les véhicules"
          description="Affiner vos résultats par statut, type de carburant et recherche"
        >
          <VehiculeFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
          />
        </MobileFilterDrawer>

        {/* Liste */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : vehicules.length === 0 ? (
          <div className="rounded-md border p-8 text-center">
            <p className="text-muted-foreground">Aucun véhicule trouvé</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            {vehicules.map((vehicule) => (
              <VehiculeListItem key={vehicule.id} vehicule={vehicule} />
            ))}
          </div>
        )}
      </div>

      {/* Dialogue de création */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau véhicule</DialogTitle>
          </DialogHeader>
          <VehiculeForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
