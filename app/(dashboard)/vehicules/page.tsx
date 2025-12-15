/**
 * Page de liste des véhicules
 * Utilise le nouveau système de toolbar responsive intégré
 *
 * Mobile : Recherche + Filtres drawer + Liste cards
 * Tablette/Desktop : Recherche + Filtres dropdown + DataTable
 */

"use client";

import { useCallback, useState, startTransition, useMemo } from "react";
import { useRouter } from "next/navigation";

import { DataTable, DataTableToolbar } from "@/components/data-table";
import { vehiculeColumns } from "@/components/vehicules/vehicule-columns";
import { VehiculeListItem } from "@/components/vehicules/vehicule-list-item";
import { VehiculeForm } from "@/components/vehicules/vehicule-form";
import { VehiculeFiltersStacked } from "@/components/vehicules/vehicule-filters-stacked";
import { VehiculeFiltersDropdown } from "@/components/vehicules/vehicule-filters-dropdown";
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
    <div className="container space-y-4 py-4 sm:space-y-6 sm:py-6">
      {/* === TOOLBAR RESPONSIVE UNIFIÉE === */}
      <DataTableToolbar
        externalSearch={{
          value: filters.search ?? "",
          onChange: (value) => updateFilters({ search: value }),
          placeholder: "Rechercher un véhicule...",
        }}
        responsiveFilters={{
          mobileContent: (
            <VehiculeFiltersStacked
              filters={filters}
              onFiltersChange={updateFilters}
            />
          ),
          desktopContent: (
            <VehiculeFiltersDropdown
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
              activeFiltersCount={activeFiltersCount}
              triggerLabel="Filtrer"
            />
          ),
          activeCount: activeFiltersCount,
          onClear: clearFilters,
          drawerTitle: "Filtres des véhicules",
          drawerDescription: "Filtrer par statut et type de carburant",
        }}
        addButton={
          canManageVehicles
            ? {
                type: "dialog",
                onClick: () => setDialogOpen(true),
                label: "Nouveau véhicule",
              }
            : undefined
        }
        enableColumnVisibility={false}
      />

      {/* === MOBILE : Liste cards === */}
      <div className="md:hidden">
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
          <div className="overflow-hidden rounded-md border">
            {vehicules.map((vehicule) => (
              <VehiculeListItem key={vehicule.id} vehicule={vehicule} />
            ))}
          </div>
        )}
      </div>

      {/* === TABLETTE & DESKTOP : DataTable === */}
      <div className="hidden md:block">
        <DataTable
          columns={vehiculeColumns}
          data={vehicules}
          isLoading={loading}
          onRowClick={handleRowClick}
          pageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          stickyHeader
          hideToolbar
        />
      </div>

      {/* Dialogue de création */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau véhicule</DialogTitle>
          </DialogHeader>
          <VehiculeForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
