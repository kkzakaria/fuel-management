/**
 * Page: Liste des missions de sous-traitance
 * Route: /sous-traitance/missions
 */

'use client'

import Link from 'next/link'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MissionTable } from '@/components/missions/mission-table'
import { useMissions } from '@/hooks/use-missions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function MissionsPage() {
  const { missions, isLoading, error, page, totalPages, total, nextPage, previousPage, refresh } = useMissions()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Missions de sous-traitance</h1>
          <p className="text-muted-foreground">
            Gérez les missions confiées aux partenaires de transport
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/sous-traitance">
            <Button variant="outline">Retour aux sous-traitants</Button>
          </Link>
          <Link href="/sous-traitance/missions/nouveau">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle mission
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors du chargement des missions: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des missions</CardTitle>
              <CardDescription>
                {isLoading
                  ? 'Chargement...'
                  : `${total} mission${total > 1 ? 's' : ''} enregistrée${total > 1 ? 's' : ''}`}
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
            <>
              <MissionTable missions={missions} onDelete={refresh} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} sur {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={previousPage}
                      disabled={page === 1 || isLoading}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={page === totalPages || isLoading}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
