/**
 * Dialogue de confirmation de suppression d'un sous-traitant
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
import { deleteSousTraitantAction } from '@/lib/actions/sous-traitants'
import type { Database } from '@/lib/supabase/database.types'

type SousTraitant = Database['public']['Tables']['sous_traitant']['Row']

interface SousTraitantDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sousTraitant: SousTraitant
  onSuccess?: () => void
}

export function SousTraitantDeleteDialog({
  open,
  onOpenChange,
  sousTraitant,
  onSuccess,
}: SousTraitantDeleteDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setLoading(true)
      const result = await deleteSousTraitantAction({ id: sousTraitant.id })

      if (result?.data?.success) {
        toast.success('Sous-traitant supprimé avec succès')
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
            Êtes-vous sûr de vouloir supprimer le sous-traitant{' '}
            <span className="font-semibold">
              {sousTraitant.nom_entreprise}
            </span>{' '}
            ?
            <br />
            <br />
            Cette action est irréversible. Le sous-traitant ne pourra être
            supprimé que s&apos;il n&apos;a aucune mission associée.
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
