/**
 * Page de liste des sous-traitants
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
import { sousTraitantColumns } from "@/components/sous-traitants/sous-traitant-columns";
import { SousTraitantListItem } from "@/components/sous-traitants/sous-traitant-list-item";
import { SousTraitantForm } from "@/components/sous-traitants/sous-traitant-form";
import { SousTraitantFiltersStacked } from "@/components/sous-traitants/sous-traitant-filters-stacked";
import { SousTraitantFiltersDropdown } from "@/components/sous-traitants/sous-traitant-filters-dropdown";
import { SousTraitantMobileSearch } from "@/components/sous-traitants/sous-traitant-mobile-search";
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
    <div className="container py-4 space-y-4 sm:py-6 sm:space-y-6">
      {/* MOBILE : Recherche + Filtres drawer + Bouton ajout + Liste */}
      <div className="md:hidden space-y-4">
        {/* Header : Recherche + Filtres + Ajout */}
        <div className="flex items-center gap-3">
          {/* Barre de recherche mobile */}
          <div className="flex-1">
            <SousTraitantMobileSearch
              value={filters.search}
              onSearchChange={(value) => updateFilters({ search: value })}
            />
          </div>

          {/* Drawer de filtres mobile */}
          <MobileFilterDrawer
            activeFiltersCount={activeFiltersCount}
            onClearFilters={clearFilters}
            title="Filtres des sous-traitants"
            description="Filtrer par statut"
          >
            <SousTraitantFiltersStacked
              filters={filters}
              onFiltersChange={updateFilters}
            />
          </MobileFilterDrawer>

          {/* Bouton Nouveau sous-traitant (icône seulement) */}
          <Button asChild size="icon" className="shrink-0">
            <Link href="/sous-traitance/nouveau">
              <Plus className="h-5 w-5" />
              <span className="sr-only">Nouveau sous-traitant</span>
            </Link>
          </Button>
        </div>

        {/* Liste */}
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
          <div className="rounded-md border overflow-hidden">
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

      {/* TABLETTE : Recherche + Filtres drawer + Table + Nouveau */}
      <div className="hidden md:block xl:hidden space-y-4">
        {/* Header : Recherche + Filtres + Nouveau */}
        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="flex-1">
            <SousTraitantMobileSearch
              value={filters.search}
              onSearchChange={(value) => updateFilters({ search: value })}
            />
          </div>

          {/* Drawer de filtres (tablette) */}
          <MobileFilterDrawer
            activeFiltersCount={activeFiltersCount}
            onClearFilters={clearFilters}
            title="Filtres des sous-traitants"
            description="Filtrer par statut"
            showOnTablet={true}
          >
            <SousTraitantFiltersStacked
              filters={filters}
              onFiltersChange={updateFilters}
            />
          </MobileFilterDrawer>

          {/* Bouton Nouveau sous-traitant */}
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau sous-traitant
          </Button>
        </div>

        {/* Table complète */}
        <DataTable
          columns={sousTraitantColumns}
          data={sousTraitants}
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
            <SousTraitantMobileSearch
              value={filters.search}
              onSearchChange={(value) => updateFilters({ search: value })}
            />
          </div>

          {/* Dropdown de filtres (desktop) */}
          <SousTraitantFiltersDropdown
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            activeFiltersCount={activeFiltersCount}
            triggerLabel="Filtrer"
          />

          {/* Spacer flex */}
          <div className="flex-1" />

          {/* Bouton Nouveau sous-traitant */}
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau sous-traitant
          </Button>
        </div>

        {/* DataTable sans recherche interne */}
        <DataTable
          columns={sousTraitantColumns}
          data={sousTraitants}
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
            <DialogTitle>Nouveau sous-traitant</DialogTitle>
          </DialogHeader>
          <SousTraitantForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
