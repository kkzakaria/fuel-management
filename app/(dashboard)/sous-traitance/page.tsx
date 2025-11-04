/**
 * Page: Liste des sous-traitants
 * Route: /sous-traitance
 */

'use client'

import { useCallback, useState, startTransition } from 'react'
import { useRouter } from 'next/navigation'

import { DataTable } from '@/components/data-table'
import { sousTraitantColumns } from '@/components/sous-traitants/sous-traitant-columns'
import { SousTraitantListItem } from '@/components/sous-traitants/sous-traitant-list-item'
import { SousTraitantForm } from '@/components/sous-traitants/sous-traitant-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useSousTraitants } from '@/hooks/use-sous-traitants'
import type { SousTraitant } from '@/lib/supabase/types'

export default function SousTraitancePage() {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const { sousTraitants, loading, error, refresh } = useSousTraitants()

  // Handler pour la navigation vers les détails
  const handleRowClick = useCallback((sousTraitant: SousTraitant) => {
    startTransition(() => {
      router.push(`/sous-traitance/${sousTraitant.id}`)
    })
  }, [router])

  // Handler pour fermer le dialogue et rafraîchir les données
  const handleSuccess = useCallback(() => {
    setDialogOpen(false)
    refresh()
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
      <div className="min-w-0">
        <h1 className="text-2xl font-bold sm:text-3xl">Sous-traitants</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Gestion des partenaires de transport
        </p>
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
          addButton={{
            type: 'dialog',
            onClick: () => setDialogOpen(true),
            label: 'Nouveau sous-traitant',
          }}
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
  )
}
