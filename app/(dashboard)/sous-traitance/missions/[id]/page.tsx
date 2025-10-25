/**
 * Page: Détails d'une mission
 * Route: /sous-traitance/missions/[id]
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, Edit, Truck, Package, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/date-utils'
import { formatCurrency } from '@/lib/format-utils'

interface MissionPageProps {
  params: Promise<{
    id: string
  }>
}

function getStatutBadgeVariant(
  statut: string
): 'default' | 'secondary' | 'destructive' {
  switch (statut) {
    case 'en_cours':
      return 'default'
    case 'terminee':
      return 'secondary'
    case 'annulee':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function getStatutLabel(statut: string): string {
  switch (statut) {
    case 'en_cours':
      return 'En cours'
    case 'terminee':
      return 'Terminée'
    case 'annulee':
      return 'Annulée'
    default:
      return statut
  }
}

function getPaymentBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'complet':
      return 'default'
    case 'partiel':
      return 'secondary'
    case 'en_attente':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function getPaymentLabel(status: string): string {
  switch (status) {
    case 'complet':
      return 'Payé'
    case 'partiel':
      return 'Partiel'
    case 'en_attente':
      return 'En attente'
    default:
      return status
  }
}

function calculatePaymentStatus(
  avance_payee: boolean | null,
  solde_paye: boolean | null
): 'en_attente' | 'partiel' | 'complet' {
  if (solde_paye && avance_payee) return 'complet'
  if (avance_payee) return 'partiel'
  return 'en_attente'
}

export async function generateMetadata({
  params,
}: MissionPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: mission } = await supabase
    .from('mission_sous_traitance')
    .select('date_mission, sous_traitant:sous_traitant(nom_entreprise)')
    .eq('id', id)
    .single()

  return {
    title: mission
      ? `Mission ${mission.date_mission} | Transport Manager`
      : 'Mission | Transport Manager',
    description: 'Détails de la mission de sous-traitance',
  }
}

export default async function MissionPage({ params }: MissionPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch mission with relations
  const { data: mission, error } = await supabase
    .from('mission_sous_traitance')
    .select(`
      *,
      sous_traitant:sous_traitant(id, nom_entreprise, telephone, email),
      localite_depart:localite!mission_sous_traitance_localite_depart_id_fkey(id, nom, region),
      localite_arrivee:localite!mission_sous_traitance_localite_arrivee_id_fkey(id, nom, region),
      type_conteneur:type_conteneur(id, nom, taille_pieds)
    `)
    .eq('id', id)
    .single()

  if (error || !mission) {
    notFound()
  }

  const statutPaiement = calculatePaymentStatus(
    mission.avance_payee,
    mission.solde_paye
  )

  const montant90 = Number(mission.montant_total) * 0.9
  const montant10 = Number(mission.montant_total) * 0.1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sous-traitance/missions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              Mission du {mission.date_mission && formatDate(new Date(mission.date_mission))}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mission.created_at && `Créée le ${formatDate(new Date(mission.created_at))}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mission.statut && (
            <Badge variant={getStatutBadgeVariant(mission.statut)}>
              {getStatutLabel(mission.statut)}
            </Badge>
          )}
          <Badge variant={getPaymentBadgeVariant(statutPaiement)}>
            {getPaymentLabel(statutPaiement)}
          </Badge>
          <Link href={`/sous-traitance/missions/${id}/modifier`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations mission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Informations de transport
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Sous-traitant
              </div>
              <div className="text-base font-medium">
                {mission.sous_traitant?.nom_entreprise || '-'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Départ
                </div>
                <div className="text-base">
                  {mission.localite_depart?.nom || '-'}
                  {mission.localite_depart?.region && (
                    <span className="text-sm text-muted-foreground">
                      {' '}
                      ({mission.localite_depart.region})
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Arrivée
                </div>
                <div className="text-base">
                  {mission.localite_arrivee?.nom || '-'}
                  {mission.localite_arrivee?.region && (
                    <span className="text-sm text-muted-foreground">
                      {' '}
                      ({mission.localite_arrivee.region})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Package className="h-4 w-4" />
                Conteneur
              </div>
              <div className="text-base">
                {mission.type_conteneur?.nom || '-'}
                {mission.numero_conteneur && (
                  <span className="text-sm text-muted-foreground">
                    {' '}
                    • {mission.numero_conteneur}
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Quantité: {mission.quantite}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations financières */}
        <Card>
          <CardHeader>
            <CardTitle>Informations financières</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Montant total
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(Number(mission.montant_total))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Avance (90%)
                </span>
                <span className="font-medium">{formatCurrency(montant90)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {mission.avance_payee ? '✓ Payée' : '✗ Non payée'}
                </span>
                {mission.date_paiement_avance && (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(new Date(mission.date_paiement_avance))}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Solde (10%)
                </span>
                <span className="font-medium">{formatCurrency(montant10)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {mission.solde_paye ? '✓ Payé' : '✗ Non payé'}
                </span>
                {mission.date_paiement_solde && (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(new Date(mission.date_paiement_solde))}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observations */}
      {mission.observations && (
        <Card>
          <CardHeader>
            <CardTitle>Observations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{mission.observations}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
