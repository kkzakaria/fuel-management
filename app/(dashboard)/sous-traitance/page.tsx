/**
 * Page: Liste des sous-traitants
 * Route: /sous-traitance
 */

'use client'

import { useCallback, useEffect, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { DataTable } from '@/components/data-table'
import { sousTraitantColumns } from '@/components/sous-traitants/sous-traitant-columns'
import { SousTraitantListItem } from '@/components/sous-traitants/sous-traitant-list-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSousTraitants } from '@/hooks/use-sous-traitants'
import type { SousTraitant } from '@/lib/supabase/types'

export default function SousTraitancePage() {
  const router = useRouter()
  const { sousTraitants, loading, error, refresh } = useSousTraitants()

  // Handler pour la navigation vers les détails
  const handleRowClick = useCallback((sousTraitant: SousTraitant) => {
    startTransition(() => {
      router.push(`/sous-traitance/${sousTraitant.id}`)
    })
  }, [router])

  // Rafraîchir quand on revient sur la page
  useEffect(() => {
    const handleFocus = () => {
      refresh()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
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
          <h1 className="text-2xl font-bold sm:text-3xl">Sous-traitants</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Gestion des partenaires de transport
          </p>
        </div>
        <Button asChild>
          <Link href="/sous-traitance/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau sous-traitant
          </Link>
        </Button>
      </div>

      {/* Desktop: DataTable avec toutes les fonctionnalités */}
      <div className="hidden md:block">
        <DataTable
          columns={sousTraitantColumns}
          data={sousTraitants}
          isLoading={loading}
          searchKey="nom_entreprise"
          searchPlaceholder="Rechercher un sous-traitant..."
          filterColumns={[
            {
              key: 'statut',
              label: 'Statut',
              options: [
                { label: 'Actif', value: 'actif' },
                { label: 'Inactif', value: 'inactif' },
                { label: 'Blacklisté', value: 'blackliste' },
              ],
            },
          ]}
          onRowClick={handleRowClick}
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
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : sousTraitants.length === 0 ? (
          <div className="rounded-md border p-8 text-center">
            <p className="text-muted-foreground">
              Aucun sous-traitant trouvé
            </p>
          </div>
        ) : (
          <div className="space-y-3">
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
    </div>
  )
}
