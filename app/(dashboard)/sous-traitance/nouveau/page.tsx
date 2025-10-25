/**
 * Page: Créer un nouveau sous-traitant
 * Route: /sous-traitance/nouveau
 */

import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SousTraitantForm } from '@/components/sous-traitants/sous-traitant-form'

export const metadata: Metadata = {
  title: 'Nouveau sous-traitant | Transport Manager',
  description: 'Créer un nouveau partenaire de transport',
}

export default function NouveauSousTraitantPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/sous-traitance">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouveau sous-traitant</h1>
          <p className="text-muted-foreground">
            Enregistrer un nouveau partenaire de transport
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du sous-traitant</CardTitle>
          <CardDescription>
            Remplissez les informations du partenaire de transport
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SousTraitantForm />
        </CardContent>
      </Card>
    </div>
  )
}
