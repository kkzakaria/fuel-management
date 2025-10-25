/**
 * Composant détails d'un sous-traitant avec onglets
 */

'use client'

import { ArrowLeft, Edit, Building2, User, Phone, Mail, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/format-utils'
import { formatDate } from '@/lib/date-utils'
import type { Database } from '@/lib/supabase/database.types'

type SousTraitant = Database['public']['Tables']['sous_traitant']['Row']
type Mission = Database['public']['Tables']['mission_sous_traitance']['Row']

interface SousTraitantDetailsProps {
  sousTraitant: SousTraitant & {
    missions?: Array<
      Mission & {
        localite_depart?: { id: string; nom: string }
        localite_arrivee?: { id: string; nom: string }
        type_conteneur?: { id: string; nom: string; taille_pieds: number }
      }
    >
  }
  stats?: {
    total_missions: number
    missions_en_cours: number
    missions_terminees: number
    montant_total_missions: number
    montant_paye: number
    montant_restant: number
  }
}

function getStatutBadgeVariant(
  statut: string
): 'default' | 'secondary' | 'destructive' {
  switch (statut) {
    case 'actif':
      return 'default'
    case 'inactif':
      return 'secondary'
    case 'blackliste':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function getStatutLabel(statut: string): string {
  switch (statut) {
    case 'actif':
      return 'Actif'
    case 'inactif':
      return 'Inactif'
    case 'blackliste':
      return 'Blacklisté'
    default:
      return statut
  }
}

function getMissionStatutBadge(statut: string) {
  switch (statut) {
    case 'en_cours':
      return <Badge variant="default">En cours</Badge>
    case 'terminee':
      return <Badge variant="secondary">Terminée</Badge>
    case 'annulee':
      return <Badge variant="destructive">Annulée</Badge>
    default:
      return <Badge variant="secondary">{statut}</Badge>
  }
}

function getPaymentStatusBadge(avance_payee: boolean, solde_paye: boolean) {
  if (solde_paye && avance_payee) {
    return <Badge variant="default">Payé</Badge>
  }
  if (avance_payee) {
    return <Badge variant="secondary">Partiel</Badge>
  }
  return <Badge variant="destructive">En attente</Badge>
}

export function SousTraitantDetails({
  sousTraitant,
  stats,
}: SousTraitantDetailsProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Header avec boutons d'action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{sousTraitant.nom_entreprise}</h1>
            {sousTraitant.created_at && (
              <p className="text-sm text-muted-foreground">
                Créé le {formatDate(new Date(sousTraitant.created_at))}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sousTraitant.statut && (
            <Badge variant={getStatutBadgeVariant(sousTraitant.statut)}>
              {getStatutLabel(sousTraitant.statut)}
            </Badge>
          )}
          <Button
            onClick={() =>
              router.push(`/sous-traitance/${sousTraitant.id}/modifier`)
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>

      <Separator />

      {/* Onglets */}
      <Tabs defaultValue="informations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="informations">Informations</TabsTrigger>
          <TabsTrigger value="missions">
            Missions ({sousTraitant.missions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="statistiques">Statistiques</TabsTrigger>
        </TabsList>

        {/* Onglet Informations */}
        <TabsContent value="informations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations de l&apos;entreprise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Nom de l&apos;entreprise
                  </div>
                  <div className="text-base font-medium">
                    {sousTraitant.nom_entreprise}
                  </div>
                </div>

                {sousTraitant.contact_principal && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Contact principal
                    </div>
                    <div className="text-base">
                      {sousTraitant.contact_principal}
                    </div>
                  </div>
                )}

                {sousTraitant.telephone && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Téléphone
                    </div>
                    <div className="text-base">{sousTraitant.telephone}</div>
                  </div>
                )}

                {sousTraitant.email && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <div className="text-base">{sousTraitant.email}</div>
                  </div>
                )}
              </div>

              {sousTraitant.adresse && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-1">
                    <MapPin className="h-4 w-4" />
                    Adresse
                  </div>
                  <div className="text-base">{sousTraitant.adresse}</div>
                </div>
              )}

              {sousTraitant.statut && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Statut
                  </div>
                  <div className="mt-1">
                    <Badge variant={getStatutBadgeVariant(sousTraitant.statut)}>
                      {getStatutLabel(sousTraitant.statut)}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Missions */}
        <TabsContent value="missions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des missions</CardTitle>
            </CardHeader>
            <CardContent>
              {!sousTraitant.missions || sousTraitant.missions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune mission enregistrée
                </p>
              ) : (
                <div className="space-y-4">
                  {sousTraitant.missions.map((mission) => (
                    <div
                      key={mission.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      onClick={() =>
                        router.push(`/sous-traitance/missions/${mission.id}`)
                      }
                    >
                      <div className="space-y-1">
                        <div className="font-medium">
                          {mission.localite_depart?.nom} →{' '}
                          {mission.localite_arrivee?.nom}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {mission.date_mission && formatDate(new Date(mission.date_mission))} •{' '}
                          {mission.type_conteneur?.nom} • Qté:{' '}
                          {mission.quantite}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(Number(mission.montant_total))}
                          </div>
                          <div className="text-sm">
                            {getPaymentStatusBadge(
                              mission.avance_payee ?? false,
                              mission.solde_paye ?? false
                            )}
                          </div>
                        </div>
                        {mission.statut && getMissionStatutBadge(mission.statut)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Statistiques */}
        <TabsContent value="statistiques" className="space-y-4">
          {stats ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total missions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_missions}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.missions_en_cours} en cours •{' '}
                    {stats.missions_terminees} terminées
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Montant total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.montant_total_missions)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Toutes missions confondues
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Montant payé</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.montant_paye)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reste: {formatCurrency(stats.montant_restant)}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  Statistiques en cours de chargement...
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
