/**
 * Page de liste des trajets
 * Affiche la table avec filtres et pagination via DataTable
 * Mobile : Recherche + Filtres drawer + Infinite scroll + FAB
 * Tablette : Table simplifiée 5 colonnes
 * Desktop : DataTable complet
 */

"use client"

import { useCallback, startTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

import { DataTable } from "@/components/data-table"
import { trajetColumns } from "@/components/trajets/trajet-columns"
import { TrajetListItemComponent } from "@/components/trajets/trajet-list-item"
import { TrajetTabletTable } from "@/components/trajets/trajet-tablet-table"
import { TrajetFilters } from "@/components/trajets/trajet-filters"
import { TrajetMobileSearch } from "@/components/trajets/trajet-mobile-search"
import { InfiniteScroll } from "@/components/ui/infinite-scroll"
import { MobileFilterDrawer } from "@/components/ui/mobile-filter-drawer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTrajets } from "@/hooks/use-trajets"
import { useTrajetFormData } from "@/hooks/use-trajet-form-data"
import type { TrajetListItem } from "@/components/trajets/trajet-table"

export default function TrajetsPage() {
  const router = useRouter()

  // Hook pour mobile (infinite scroll)
  const mobileData = useTrajets({
    mode: "infinite",
    pageSize: 20,
    autoRefresh: 60000,
  })

  // Hook pour tablette/desktop (pagination normale)
  const desktopData = useTrajets({
    mode: "paginated",
    pageSize: 100, // DataTable gère la pagination en local
    autoRefresh: 60000,
  })

  // Charger les données pour les filtres
  const { chauffeurs, vehicules, localites } = useTrajetFormData()

  // Calculer le nombre de filtres actifs (mobile + desktop utilisent les mêmes filtres)
  const activeFiltersCount = useMemo(() => {
    const filters = mobileData.filters
    let count = 0
    if (filters.chauffeur_id) count++
    if (filters.vehicule_id) count++
    if (filters.localite_arrivee_id) count++
    if (filters.date_debut || filters.date_fin) count++
    if (filters.statut) count++
    return count
  }, [mobileData.filters])

  // Handler pour la navigation vers les détails (desktop)
  const handleRowClick = useCallback((trajet: TrajetListItem) => {
    startTransition(() => {
      router.push(`/trajets/${trajet.id}`)
    })
  }, [router])

  // Gestion d'erreur
  const error = mobileData.error || desktopData.error
  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-semibold">Erreur de chargement</p>
              <p className="text-sm">{error.message}</p>
              <Button onClick={() => mobileData.refresh()} variant="outline" className="mt-4">
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-4 space-y-4 sm:py-6 sm:space-y-6">
      {/* MOBILE : Recherche + Filtres drawer + Bouton ajout + Infinite scroll */}
      <div className="md:hidden space-y-4">
        {/* Header : Recherche + Filtres + Ajout (une seule ligne) */}
        <div className="flex items-center gap-3">
          {/* Barre de recherche mobile */}
          <div className="flex-1">
            <TrajetMobileSearch
              value={mobileData.filters.search}
              onSearchChange={(value) => mobileData.updateFilters({ search: value })}
            />
          </div>

          {/* Drawer de filtres mobile */}
          <MobileFilterDrawer
            activeFiltersCount={activeFiltersCount}
            onClearFilters={mobileData.clearFilters}
            title="Filtres des trajets"
            description="Filtrer par date, chauffeur, véhicule, destination ou statut"
          >
            <TrajetFilters
              filters={mobileData.filters}
              onFiltersChange={mobileData.updateFilters}
              onClearFilters={mobileData.clearFilters}
              chauffeurs={chauffeurs}
              vehicules={vehicules}
              localites={localites}
              hideClearButton={true}
            />
          </MobileFilterDrawer>

          {/* Bouton Nouveau trajet (icône seulement) */}
          <Button asChild size="icon" className="shrink-0">
            <Link href="/trajets/nouveau">
              <Plus className="h-5 w-5" />
              <span className="sr-only">Nouveau trajet</span>
            </Link>
          </Button>
        </div>

        {/* Liste avec infinite scroll */}
        {mobileData.loading && mobileData.trajets.length === 0 ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : mobileData.trajets.length === 0 ? (
          <div className="rounded-md border p-8 text-center">
            <p className="text-muted-foreground">Aucun trajet trouvé</p>
          </div>
        ) : (
          <InfiniteScroll
            onLoadMore={mobileData.loadMore}
            hasMore={mobileData.hasNextPage}
            loading={mobileData.loading}
          >
            {mobileData.trajets.map((trajet) => (
              <TrajetListItemComponent key={trajet.id} trajet={trajet} />
            ))}
          </InfiniteScroll>
        )}
      </div>

      {/* TABLETTE : Table simplifiée 5 colonnes avec drawer de filtres */}
      <div className="hidden md:block xl:hidden space-y-4">
        {/* Header : Recherche + Filtres + Nouveau (une seule ligne) */}
        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="flex-1">
            <TrajetMobileSearch
              value={desktopData.filters.search}
              onSearchChange={(value) => desktopData.updateFilters({ search: value })}
            />
          </div>

          {/* Drawer de filtres (tablette) */}
          <MobileFilterDrawer
            activeFiltersCount={activeFiltersCount}
            onClearFilters={desktopData.clearFilters}
            title="Filtres des trajets"
            description="Filtrer par date, chauffeur, véhicule, destination ou statut"
            showOnTablet={true}
          >
            <TrajetFilters
              filters={desktopData.filters}
              onFiltersChange={desktopData.updateFilters}
              onClearFilters={desktopData.clearFilters}
              chauffeurs={chauffeurs}
              vehicules={vehicules}
              localites={localites}
              hideClearButton={true}
            />
          </MobileFilterDrawer>

          {/* Bouton Nouveau trajet */}
          <Button asChild>
            <Link href="/trajets/nouveau">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau trajet
            </Link>
          </Button>
        </div>

        {/* Table simplifiée */}
        <TrajetTabletTable
          trajets={desktopData.trajets}
          loading={desktopData.loading}
        />
      </div>

      {/* DESKTOP : DataTable complet */}
      <div className="hidden xl:block">
        <DataTable
          columns={trajetColumns}
          data={desktopData.trajets}
          isLoading={desktopData.loading}
          searchKey="date_trajet"
          searchPlaceholder="Rechercher par date..."
          onRowClick={handleRowClick}
          pageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          stickyHeader
          addButton={{
            type: "link",
            href: "/trajets/nouveau",
            label: "Nouveau trajet",
          }}
        />
      </div>
    </div>
  )
}
