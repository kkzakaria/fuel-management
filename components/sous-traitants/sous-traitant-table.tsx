/**
 * Composant Table des sous-traitants
 * Affiche la liste des sous-traitants avec actions
 */

'use client'

import { useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'
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
import { SousTraitantDeleteDialog } from './sous-traitant-delete-dialog'
import { useState } from 'react'
import type { Database } from '@/lib/supabase/database.types'

type SousTraitant = Database['public']['Tables']['sous_traitant']['Row']

interface SousTraitantTableProps {
  sousTraitants: SousTraitant[]
  onDelete?: () => void
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

export function SousTraitantTable({
  sousTraitants,
  onDelete,
}: SousTraitantTableProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSousTraitant, setSelectedSousTraitant] =
    useState<SousTraitant | null>(null)

  const handleRowClick = (id: string) => {
    router.push(`/sous-traitance/${id}`)
  }

  const handleDelete = (sousTraitant: SousTraitant) => {
    setSelectedSousTraitant(sousTraitant)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false)
    setSelectedSousTraitant(null)
    if (onDelete) {
      onDelete()
    }
  }

  if (sousTraitants.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucun sous-traitant trouvé
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entreprise</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sousTraitants.map((sousTraitant) => (
              <TableRow
                key={sousTraitant.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(sousTraitant.id)}
              >
                <TableCell className="font-medium">
                  <div>
                    <div>{sousTraitant.nom_entreprise}</div>
                    {sousTraitant.adresse && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">
                          {sousTraitant.adresse}
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{sousTraitant.contact_principal || '-'}</TableCell>
                <TableCell>
                  {sousTraitant.telephone ? (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{sousTraitant.telephone}</span>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {sousTraitant.email ? (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{sousTraitant.email}</span>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {sousTraitant.statut && (
                    <Badge variant={getStatutBadgeVariant(sousTraitant.statut)}>
                      {getStatutLabel(sousTraitant.statut)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
                          router.push(`/sous-traitance/${sousTraitant.id}`)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(
                            `/sous-traitance/${sousTraitant.id}/modifier`
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
                          handleDelete(sousTraitant)
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

      {selectedSousTraitant && (
        <SousTraitantDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          sousTraitant={selectedSousTraitant}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  )
}
