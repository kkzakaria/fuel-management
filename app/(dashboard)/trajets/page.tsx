/**
 * Page de liste des trajets
 * Affiche la table avec filtres et pagination via DataTable
 */

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

import { DataTable } from "@/components/data-table"
import { trajetColumns } from "@/components/trajets/trajet-columns"
import { TrajetListItemComponent } from "@/components/trajets/trajet-list-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTrajets } from "@/hooks/use-trajets"

export default function TrajetsPage() {
  const router = useRouter()
  const { trajets, loading, error, refresh } = useTrajets({
    pageSize: 100, // DataTable gère la pagination en local
    autoRefresh: 60000, // Refresh every minute
  })

  // Rafraîchir quand on revient sur la page
  useEffect(() => {
    const handleFocus = () => {
      refresh()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [refresh])

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
    )
  }

  return (
    <div className="container py-4 space-y-4 sm:py-6 sm:space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold sm:text-3xl">Trajets</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Gestion des trajets et livraisons de conteneurs
          </p>
        </div>
        <Button asChild>
          <Link href="/trajets/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau trajet
          </Link>
        </Button>
      </div>

      {/* Desktop: DataTable avec toutes les fonctionnalités */}
      <div className="hidden md:block">
        <DataTable
          columns={trajetColumns}
          data={trajets}
          isLoading={loading}
          searchKey="date_trajet"
          searchPlaceholder="Rechercher par date..."
          onRowClick={(trajet) => router.push(`/trajets/${trajet.id}`)}
          pageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          stickyHeader
        />
      </div>

      {/* Mobile: Vue en cartes */}
      <div className="md:hidden">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : trajets.length === 0 ? (
          <div className="rounded-md border p-8 text-center">
            <p className="text-muted-foreground">Aucun trajet trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trajets.map((trajet) => (
              <TrajetListItemComponent key={trajet.id} trajet={trajet} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
