/**
 * Page: Détails d'un sous-traitant
 * Route: /sous-traitance/[id]
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SousTraitantDetails } from '@/components/sous-traitants/sous-traitant-details'
import { fetchSousTraitantStats } from '@/lib/supabase/sous-traitant-queries'

interface SousTraitantPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params,
}: SousTraitantPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: sousTraitant } = await supabase
    .from('sous_traitant')
    .select('nom_entreprise')
    .eq('id', id)
    .single()

  return {
    title: sousTraitant
      ? `${sousTraitant.nom_entreprise} | Transport Manager`
      : 'Sous-traitant | Transport Manager',
    description: 'Détails du partenaire de transport',
  }
}

export default async function SousTraitantPage({
  params,
}: SousTraitantPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch sous-traitant with missions
  const { data: sousTraitant, error } = await supabase
    .from('sous_traitant')
    .select(`
      *,
      missions:mission_sous_traitance(
        *,
        localite_depart:localite!mission_sous_traitance_localite_depart_id_fkey(id, nom),
        localite_arrivee:localite!mission_sous_traitance_localite_arrivee_id_fkey(id, nom),
        type_conteneur(id, nom, taille_pieds)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !sousTraitant) {
    notFound()
  }

  // Fetch statistics
  const stats = await fetchSousTraitantStats(id)

  return (
    <SousTraitantDetails
      sousTraitant={sousTraitant}
      stats={stats}
    />
  )
}
