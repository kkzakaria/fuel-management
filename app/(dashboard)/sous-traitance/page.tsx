/**
 * Page: Liste des sous-traitants
 * Route: /sous-traitance
 */

'use client'

import Link from 'next/link'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SousTraitantFilters } from '@/components/sous-traitants/sous-traitant-filters'
import { SousTraitantTable } from '@/components/sous-traitants/sous-traitant-table'
import { useSousTraitants } from '@/hooks/use-sous-traitants'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function SousTraitancePage() {
  const { sousTraitants, isLoading, error, filters, updateFilters, clearFilters, refresh } = useSousTraitants()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sous-traitants</h1>
          <p className="text-muted-foreground">
            Gérez vos partenaires de transport et leurs missions
          </p>
        </div>
        <Link href="/sous-traitance/nouveau">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau sous-traitant
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors du chargement des sous-traitants: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres de recherche</CardTitle>
          <CardDescription>
            Filtrez les sous-traitants par nom, contact ou statut
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SousTraitantFilters
            filters={filters}
            onFilterChange={updateFilters}
            onClearFilters={clearFilters}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des sous-traitants</CardTitle>
              <CardDescription>
                {isLoading
                  ? 'Chargement...'
                  : `${sousTraitants.length} partenaire${sousTraitants.length > 1 ? 's' : ''} de transport`}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <SousTraitantTable sousTraitants={sousTraitants} onDelete={refresh} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
