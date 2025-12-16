/**
 * Page de liste des trajets
 * Affiche la table avec filtres et pagination via DataTable
 * Utilise le nouveau système de toolbar responsive intégré
 *
 * Mobile : Recherche + Filtres drawer + Infinite scroll + Cards
 * Tablette : Recherche + Filtres drawer + Table simplifiée
 * Desktop : Recherche + Filtres dropdown + DataTable complet
 */

"use client"

import { useCallback, startTransition, useMemo } from "react"
import { useRouter } from "next/navigation"

import { DataTable, DataTableToolbar } from "@/components/data-table"
import { trajetColumns } from "@/components/trajets/trajet-columns"
import { TrajetListItemComponent } from "@/components/trajets/trajet-list-item"
import { TrajetTabletTable } from "@/components/trajets/trajet-tablet-table"
import { TrajetFiltersStacked } from "@/components/trajets/trajet-filters-stacked"
import { TrajetFiltersDropdown } from "@/components/trajets/trajet-filters-dropdown"
import { InfiniteScroll } from "@/components/ui/infinite-scroll"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTrajets } from "@/hooks/use-trajets"
import { useTrajetFormData } from "@/hooks/use-trajet-form-data"
import { useUserRole } from "@/hooks/use-user-role"
import type { TrajetListItem } from "@/components/trajets/trajet-table"

export default function TrajetsPage() {
  const router = useRouter()
  const { canCreateTrips } = useUserRole()

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
    if (filters.chauffeur_id && filters.chauffeur_id.length > 0) {
      count += filters.chauffeur_id.split(",").length
    }
    if (filters.vehicule_id && filters.vehicule_id.length > 0) {
      count += filters.vehicule_id.split(",").length
    }
    if (filters.localite_arrivee_id && filters.localite_arrivee_id.length > 0) {
      count += filters.localite_arrivee_id.split(",").length
    }
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
    <div className="container space-y-4 py-4 sm:space-y-6 sm:py-6">
      {/* === TOOLBAR RESPONSIVE UNIFIÉE === */}
      <DataTableToolbar
        externalSearch={{
          value: mobileData.filters.search ?? "",
          onChange: (value) => mobileData.updateFilters({ search: value }),
          placeholder: "Rechercher un trajet...",
        }}
        responsiveFilters={{
          mobileContent: (
            <TrajetFiltersStacked
              filters={mobileData.filters}
              onFiltersChange={mobileData.updateFilters}
              chauffeurs={chauffeurs}
              vehicules={vehicules}
              localites={localites}
            />
          ),
          desktopContent: (
            <TrajetFiltersDropdown
              filters={desktopData.filters}
              onFiltersChange={desktopData.updateFilters}
              onClearFilters={desktopData.clearFilters}
              chauffeurs={chauffeurs}
              vehicules={vehicules}
              localites={localites}
              activeFiltersCount={activeFiltersCount}
              triggerLabel="Filtrer"
            />
          ),
          activeCount: activeFiltersCount,
          onClear: mobileData.clearFilters,
          drawerTitle: "Filtres des trajets",
          drawerDescription: "Filtrer par date, chauffeur, véhicule, destination ou statut",
        }}
        addButton={canCreateTrips ? {
          type: "link",
          href: "/trajets/nouveau",
          label: "Nouveau trajet",
        } : undefined}
        enableColumnVisibility={false}
      />

      {/* === MOBILE : Liste avec infinite scroll (cards) === */}
      <div className="md:hidden">
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

      {/* === TABLETTE : Table simplifiée 5 colonnes === */}
      <div className="hidden md:block xl:hidden">
        <TrajetTabletTable
          trajets={desktopData.trajets}
          loading={desktopData.loading}
        />
      </div>

      {/* === DESKTOP : DataTable complet === */}
      <div className="hidden xl:block">
        <DataTable
          columns={trajetColumns}
          data={desktopData.trajets}
          isLoading={desktopData.loading}
          onRowClick={handleRowClick}
          pageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          stickyHeader
          hideToolbar // La toolbar est gérée séparément ci-dessus
        />
      </div>
    </div>
  )
}
