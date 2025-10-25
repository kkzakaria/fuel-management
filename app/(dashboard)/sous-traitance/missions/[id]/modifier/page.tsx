/**
 * Page: Modifier une mission
 * Route: /sous-traitance/missions/[id]/modifier
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MissionForm } from '@/components/missions/mission-form'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/date-utils'

interface ModifierMissionPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params,
}: ModifierMissionPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: mission } = await supabase
    .from('mission_sous_traitance')
    .select('date_mission')
    .eq('id', id)
    .single()

  return {
    title: mission
      ? `Modifier mission ${mission.date_mission} | Transport Manager`
      : 'Modifier mission | Transport Manager',
    description: 'Modifier les informations de la mission',
  }
}

export default async function ModifierMissionPage({
  params,
}: ModifierMissionPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch mission
  const { data: mission, error } = await supabase
    .from('mission_sous_traitance')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !mission) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/sous-traitance/missions/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Modifier mission du {mission.date_mission && formatDate(new Date(mission.date_mission))}
          </h1>
          <p className="text-muted-foreground">
            Mettre à jour les informations de la mission
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de la mission</CardTitle>
          <CardDescription>
            Modifiez les détails de la mission de transport
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MissionForm mission={mission} />
        </CardContent>
      </Card>
    </div>
  )
}
