/**
 * Composant Formulaire sous-traitant
 * Création et modification de sous-traitants
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  createSousTraitantSchema,
  type CreateSousTraitantInput,
} from '@/lib/validations/sous-traitant'
import {
  createSousTraitantAction,
  updateSousTraitantAction,
} from '@/lib/actions/sous-traitants'
import type { Database } from '@/lib/supabase/database.types'

type SousTraitant = Database['public']['Tables']['sous_traitant']['Row']

interface SousTraitantFormProps {
  sousTraitant?: SousTraitant
  onSuccess?: () => void
}

export function SousTraitantForm({
  sousTraitant,
  onSuccess,
}: SousTraitantFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEditing = Boolean(sousTraitant)

  const form = useForm<CreateSousTraitantInput>({
    resolver: zodResolver(createSousTraitantSchema),
    defaultValues: {
      nom_entreprise: sousTraitant?.nom_entreprise || '',
      contact_principal: sousTraitant?.contact_principal || '',
      telephone: sousTraitant?.telephone || '',
      email: sousTraitant?.email || '',
      adresse: sousTraitant?.adresse || '',
      statut:
        (sousTraitant?.statut as 'actif' | 'inactif' | 'blackliste') || 'actif',
    },
  })

  const onSubmit = async (data: CreateSousTraitantInput) => {
    try {
      setLoading(true)

      if (isEditing) {
        const result = await updateSousTraitantAction({
          id: sousTraitant!.id,
          data,
        })

        if (result?.data) {
          toast.success('Sous-traitant modifié avec succès')
          if (onSuccess) {
            onSuccess()
          } else {
            router.push(`/sous-traitance/${sousTraitant!.id}`)
          }
        }
      } else {
        const result = await createSousTraitantAction(data)

        if (result?.data) {
          toast.success('Sous-traitant créé avec succès')
          form.reset()
          if (onSuccess) {
            onSuccess()
          } else {
            router.push('/sous-traitance')
          }
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la sauvegarde'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Nom entreprise */}
          <FormField
            control={form.control}
            name="nom_entreprise"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nom de l&apos;entreprise *</FormLabel>
                <FormControl>
                  <Input placeholder="SARL Transport Express" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact principal */}
          <FormField
            control={form.control}
            name="contact_principal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact principal</FormLabel>
                <FormControl>
                  <Input placeholder="Kouassi Jean" {...field} />
                </FormControl>
                <FormDescription>
                  Nom de la personne de contact
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Téléphone */}
          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="+225 01 02 03 04 05" {...field} />
                </FormControl>
                <FormDescription>Format: +225 XX XX XX XX XX</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="contact@entreprise.ci"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Statut */}
          <FormField
            control={form.control}
            name="statut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                    <SelectItem value="blackliste">Blacklisté</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Adresse */}
          <FormField
            control={form.control}
            name="adresse"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Adresse complète de l'entreprise"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
