/**
 * Page: Créer une nouvelle mission
 * Route: /sous-traitance/missions/nouveau
 */

import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MissionForm } from '@/components/missions/mission-form'

export const metadata: Metadata = {
  title: 'Nouvelle mission | Transport Manager',
  description: 'Créer une nouvelle mission de sous-traitance',
}

export default function NouvelleMissionPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/sous-traitance/missions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouvelle mission</h1>
          <p className="text-muted-foreground">
            Enregistrer une nouvelle mission de sous-traitance
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de la mission</CardTitle>
          <CardDescription>
            Remplissez les détails de la mission de transport
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MissionForm />
        </CardContent>
      </Card>
    </div>
  )
}
