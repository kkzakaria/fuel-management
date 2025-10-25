/**
 * Composant Table des missions
 * Affiche la liste des missions avec actions
 */

'use client'

import { useRouter } from 'next/navigation'
import { MoreHorizontal, Eye, Edit, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { MissionDeleteDialog } from './mission-delete-dialog'
import { useState } from 'react'
import { formatCurrency } from '@/lib/format-utils'
import { formatDate } from '@/lib/date-utils'

interface Mission {
  id: string
  date_mission: string
  montant_total: number | string
  avance_payee: boolean | null
  solde_paye: boolean | null
  statut: string | null
  quantite: number | null
  numero_conteneur?: string | null
  sous_traitant?: { id: string; nom_entreprise: string } | null
  localite_depart?: { id: string; nom: string } | null
  localite_arrivee?: { id: string; nom: string } | null
  type_conteneur?: { id: string; nom: string; taille_pieds: number } | null
  statut_paiement?: 'en_attente' | 'partiel' | 'complet'
}

interface MissionTableProps {
  missions: Mission[]
  onDelete?: () => void
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

export function MissionTable({ missions, onDelete }: MissionTableProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)

  const handleRowClick = (id: string) => {
    router.push(`/sous-traitance/missions/${id}`)
  }

  const handleDelete = (mission: Mission) => {
    setSelectedMission(mission)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false)
    setSelectedMission(null)
    if (onDelete) {
      onDelete()
    }
  }

  if (missions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucune mission trouvée
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Sous-traitant</TableHead>
              <TableHead>Trajet</TableHead>
              <TableHead>Conteneur</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {missions.map((mission) => (
              <TableRow
                key={mission.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(mission.id)}
              >
                <TableCell>
                  {formatDate(new Date(mission.date_mission))}
                </TableCell>
                <TableCell className="font-medium">
                  {mission.sous_traitant?.nom_entreprise || '-'}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {mission.localite_depart?.nom} → {mission.localite_arrivee?.nom}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">
                        {mission.type_conteneur?.nom}
                      </div>
                      {mission.numero_conteneur && (
                        <div className="text-xs text-muted-foreground">
                          {mission.numero_conteneur}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Qté: {mission.quantite ?? '-'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(Number(mission.montant_total))}
                </TableCell>
                <TableCell>
                  {mission.statut_paiement && (
                    <Badge
                      variant={getPaymentBadgeVariant(mission.statut_paiement)}
                    >
                      {getPaymentLabel(mission.statut_paiement)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {mission.statut && (
                    <Badge variant={getStatutBadgeVariant(mission.statut)}>
                      {getStatutLabel(mission.statut)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Ouvrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/sous-traitance/missions/${mission.id}`)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(
                            `/sous-traitance/missions/${mission.id}/modifier`
                          )
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(mission)
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedMission && (
        <MissionDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          mission={selectedMission}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  )
}
