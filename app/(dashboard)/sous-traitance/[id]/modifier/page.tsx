/**
 * Page: Modifier un sous-traitant
 * Route: /sous-traitance/[id]/modifier
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SousTraitantForm } from '@/components/sous-traitants/sous-traitant-form'
import { createClient } from '@/lib/supabase/server'

interface ModifierSousTraitantPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params,
}: ModifierSousTraitantPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: sousTraitant } = await supabase
    .from('sous_traitant')
    .select('nom_entreprise')
    .eq('id', id)
    .single()

  return {
    title: sousTraitant
      ? `Modifier ${sousTraitant.nom_entreprise} | Transport Manager`
      : 'Modifier sous-traitant | Transport Manager',
    description: 'Modifier les informations du partenaire de transport',
  }
}

export default async function ModifierSousTraitantPage({
  params,
}: ModifierSousTraitantPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch sous-traitant
  const { data: sousTraitant, error } = await supabase
    .from('sous_traitant')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !sousTraitant) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/sous-traitance/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Modifier {sousTraitant.nom_entreprise}
          </h1>
          <p className="text-muted-foreground">
            Mettre à jour les informations du partenaire
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du sous-traitant</CardTitle>
          <CardDescription>
            Modifiez les informations du partenaire de transport
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SousTraitantForm sousTraitant={sousTraitant} />
        </CardContent>
      </Card>
    </div>
  )
}
