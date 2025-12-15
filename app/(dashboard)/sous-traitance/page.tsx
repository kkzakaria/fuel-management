/**
 * Page de liste des sous-traitants
 * Utilise le nouveau système de toolbar responsive intégré
 *
 * Mobile : Recherche + Filtres drawer + Liste cards
 * Tablette/Desktop : Recherche + Filtres dropdown + DataTable
 */

"use client";

import { useCallback, useState, startTransition, useMemo } from "react";
import { useRouter } from "next/navigation";

import { DataTable, DataTableToolbar } from "@/components/data-table";
import { sousTraitantColumns } from "@/components/sous-traitants/sous-traitant-columns";
import { SousTraitantListItem } from "@/components/sous-traitants/sous-traitant-list-item";
import { SousTraitantForm } from "@/components/sous-traitants/sous-traitant-form";
import { SousTraitantFiltersStacked } from "@/components/sous-traitants/sous-traitant-filters-stacked";
import { SousTraitantFiltersDropdown } from "@/components/sous-traitants/sous-traitant-filters-dropdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSousTraitants } from "@/hooks/use-sous-traitants";
import type { SousTraitant } from "@/lib/supabase/types";

export default function SousTraitancePage() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { sousTraitants, loading, error, filters, updateFilters, clearFilters, refresh } = useSousTraitants({
    autoRefresh: 60000,
  });

  // Calculer le nombre de filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.statut) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  // Handler pour la navigation vers les détails
  const handleRowClick = useCallback((sousTraitant: SousTraitant) => {
    startTransition(() => {
      router.push(`/sous-traitance/${sousTraitant.id}`);
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
          placeholder: "Rechercher un sous-traitant...",
        }}
        responsiveFilters={{
          mobileContent: (
            <SousTraitantFiltersStacked
              filters={filters}
              onFiltersChange={updateFilters}
            />
          ),
          desktopContent: (
            <SousTraitantFiltersDropdown
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
              activeFiltersCount={activeFiltersCount}
              triggerLabel="Filtrer"
            />
          ),
          activeCount: activeFiltersCount,
          onClear: clearFilters,
          drawerTitle: "Filtres des sous-traitants",
          drawerDescription: "Filtrer par statut",
        }}
        addButton={{
          type: "dialog",
          onClick: () => setDialogOpen(true),
          label: "Nouveau sous-traitant",
        }}
        enableColumnVisibility={false}
      />

      {/* === MOBILE : Liste cards === */}
      <div className="md:hidden">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : sousTraitants.length === 0 ? (
          <div className="rounded-md border p-8 text-center">
            <p className="text-muted-foreground">Aucun sous-traitant trouvé</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border">
            {sousTraitants.map((sousTraitant) => (
              <SousTraitantListItem
                key={sousTraitant.id}
                sousTraitant={sousTraitant}
                onDelete={refresh}
              />
            ))}
          </div>
        )}
      </div>

      {/* === TABLETTE & DESKTOP : DataTable === */}
      <div className="hidden md:block">
        <DataTable
          columns={sousTraitantColumns}
          data={sousTraitants}
          isLoading={loading}
          onRowClick={handleRowClick}
          pageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          stickyHeader
          hideToolbar // La toolbar est gérée séparément ci-dessus
        />
      </div>

      {/* Dialogue de création */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau sous-traitant</DialogTitle>
          </DialogHeader>
          <SousTraitantForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
