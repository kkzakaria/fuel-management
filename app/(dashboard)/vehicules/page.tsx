/**
 * Page de liste des véhicules
 * Mobile : Recherche + Filtres drawer + Liste + FAB
 * Tablette : Recherche + Filtres drawer + Table + Bouton ajout
 * Desktop : Recherche + Filtres dropdown + DataTable + Bouton ajout
 */

"use client";

import { useCallback, useState, startTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { vehiculeColumns } from "@/components/vehicules/vehicule-columns";
import { VehiculeListItem } from "@/components/vehicules/vehicule-list-item";
import { VehiculeForm } from "@/components/vehicules/vehicule-form";
import { VehiculeFiltersStacked } from "@/components/vehicules/vehicule-filters-stacked";
import { VehiculeFiltersDropdown } from "@/components/vehicules/vehicule-filters-dropdown";
import { VehiculeMobileSearch } from "@/components/vehicules/vehicule-mobile-search";
import { MobileFilterDrawer } from "@/components/ui/mobile-filter-drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useVehicules } from "@/hooks/use-vehicules";
import { useUserRole } from "@/hooks/use-user-role";
import type { Vehicule } from "@/lib/supabase/types";

export default function VehiculesPage() {
  const router = useRouter();
  const { canManageVehicles } = useUserRole();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { vehicules, loading, error, filters, updateFilters, clearFilters, refresh } = useVehicules({
    pageSize: 100,
    autoRefresh: 60000,
  });

  // Calculer le nombre de filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.statut) count++;
    if (filters.type_carburant) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

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
      {/* MOBILE : Recherche + Filtres drawer + Bouton ajout + Liste */}
      <div className="md:hidden space-y-4">
        {/* Header : Recherche + Filtres + Ajout */}
        <div className="flex items-center gap-3">
          {/* Barre de recherche mobile */}
          <div className="flex-1">
            <VehiculeMobileSearch
              value={filters.search}
              onSearchChange={(value) => updateFilters({ search: value })}
            />
          </div>

          {/* Drawer de filtres mobile */}
          <MobileFilterDrawer
            activeFiltersCount={activeFiltersCount}
            onClearFilters={clearFilters}
            title="Filtres des véhicules"
            description="Filtrer par statut et type de carburant"
          >
            <VehiculeFiltersStacked
              filters={filters}
              onFiltersChange={updateFilters}
            />
          </MobileFilterDrawer>

          {/* Bouton Nouveau véhicule (icône seulement) */}
          {canManageVehicles && (
            <Button asChild size="icon" className="shrink-0">
              <Link href="/vehicules/nouveau">
                <Plus className="h-5 w-5" />
                <span className="sr-only">Nouveau véhicule</span>
              </Link>
            </Button>
          )}
        </div>

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

      {/* TABLETTE : Recherche + Filtres drawer + Table + Nouveau */}
      <div className="hidden md:block xl:hidden space-y-4">
        {/* Header : Recherche + Filtres + Nouveau */}
        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="flex-1">
            <VehiculeMobileSearch
              value={filters.search}
              onSearchChange={(value) => updateFilters({ search: value })}
            />
          </div>

          {/* Drawer de filtres (tablette) */}
          <MobileFilterDrawer
            activeFiltersCount={activeFiltersCount}
            onClearFilters={clearFilters}
            title="Filtres des véhicules"
            description="Filtrer par statut et type de carburant"
            showOnTablet={true}
          >
            <VehiculeFiltersStacked
              filters={filters}
              onFiltersChange={updateFilters}
            />
          </MobileFilterDrawer>

          {/* Bouton Nouveau véhicule */}
          {canManageVehicles && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau véhicule
            </Button>
          )}
        </div>

        {/* Table complète */}
        <DataTable
          columns={vehiculeColumns}
          data={vehicules}
          isLoading={loading}
          onRowClick={handleRowClick}
          pageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          stickyHeader
        />
      </div>

      {/* DESKTOP : Recherche + Filtres dropdown + DataTable + Nouveau */}
      <div className="hidden xl:block space-y-4">
        {/* Header : Recherche + Filtres dropdown + Nouveau */}
        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="w-full max-w-sm">
            <VehiculeMobileSearch
              value={filters.search}
              onSearchChange={(value) => updateFilters({ search: value })}
            />
          </div>

          {/* Dropdown de filtres (desktop) */}
          <VehiculeFiltersDropdown
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            activeFiltersCount={activeFiltersCount}
            triggerLabel="Filtrer"
          />

          {/* Spacer flex */}
          <div className="flex-1" />

          {/* Bouton Nouveau véhicule */}
          {canManageVehicles && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau véhicule
            </Button>
          )}
        </div>

        {/* DataTable sans recherche interne */}
        <DataTable
          columns={vehiculeColumns}
          data={vehicules}
          isLoading={loading}
          onRowClick={handleRowClick}
          pageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          stickyHeader
        />
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
