/**
 * Page de liste des chauffeurs
 * Affiche la table avec filtres et pagination via DataTable
 */

"use client"

import { useCallback, startTransition } from "react"
import { useRouter } from "next/navigation"

import { DataTable } from "@/components/data-table"
import { chauffeurColumns } from "@/components/chauffeurs/chauffeur-columns"
import { ChauffeurListItem } from "@/components/chauffeurs/chauffeur-list-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useChauffeurs } from "@/hooks/use-chauffeurs"
import { useUserRole } from "@/hooks/use-user-role"
import type { Chauffeur } from "@/lib/supabase/types"

export default function ChauffeursPage() {
  const router = useRouter()
  const { canManageDrivers } = useUserRole()
  const { chauffeurs, loading, error, refresh } = useChauffeurs({
    pageSize: 100, // DataTable gère la pagination en local
    autoRefresh: 60000, // Refresh every minute
  })

  // Handler pour la navigation vers les détails
  const handleRowClick = useCallback((chauffeur: Chauffeur) => {
    startTransition(() => {
      router.push(`/chauffeurs/${chauffeur.id}`)
    })
  }, [router])

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
      <div className="min-w-0">
        <h1 className="text-2xl font-bold sm:text-3xl">Chauffeurs</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Gestion des chauffeurs et performance
        </p>
      </div>

      {/* Desktop: DataTable avec toutes les fonctionnalités */}
      <div className="hidden md:block">
        <DataTable
          columns={chauffeurColumns}
          data={chauffeurs}
          isLoading={loading}
          searchKey="nom_complet"
          searchPlaceholder="Rechercher un chauffeur..."
          filterColumns={[
            {
              key: "statut",
              label: "Statut",
              options: [
                { label: "Actif", value: "actif" },
                { label: "Inactif", value: "inactif" },
                { label: "Suspendu", value: "suspendu" },
              ],
            },
          ]}
          onRowClick={handleRowClick}
          pageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          stickyHeader
          addButton={{
            type: "link",
            href: "/chauffeurs/nouveau",
            label: "Nouveau chauffeur",
            permission: canManageDrivers,
          }}
        />
      </div>

      {/* Mobile: Vue en cartes */}
      <div className="md:hidden">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : chauffeurs.length === 0 ? (
          <div className="rounded-md border p-8 text-center">
            <p className="text-muted-foreground">Aucun chauffeur trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chauffeurs.map((chauffeur) => (
              <ChauffeurListItem key={chauffeur.id} chauffeur={chauffeur} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
