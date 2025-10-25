/**
 * Dialogue de confirmation de suppression d'une mission
 */

'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { deleteMissionAction } from '@/lib/actions/missions'
import { formatDate } from '@/lib/date-utils'

interface Mission {
  id: string
  date_mission: string
  localite_depart?: { nom: string } | null
  localite_arrivee?: { nom: string } | null
}

interface MissionDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mission: Mission
  onSuccess?: () => void
}

export function MissionDeleteDialog({
  open,
  onOpenChange,
  mission,
  onSuccess,
}: MissionDeleteDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setLoading(true)
      const result = await deleteMissionAction({ id: mission.id })

      if (result?.data?.success) {
        toast.success('Mission supprimée avec succès')
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la suppression'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer la mission du{' '}
            <span className="font-semibold">
              {formatDate(new Date(mission.date_mission))}
            </span>{' '}
            {mission.localite_depart && mission.localite_arrivee && (
              <>
                ({mission.localite_depart.nom} → {mission.localite_arrivee.nom})
              </>
            )}
            ?
            <br />
            <br />
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
