/**
 * Composant Formulaire mission
 * Création et modification de missions de sous-traitance
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Calendar as CalendarIcon } from 'lucide-react'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  createMissionSchema,
  type CreateMissionInput,
} from '@/lib/validations/mission'
import {
  createMissionAction,
  updateMissionAction,
} from '@/lib/actions/missions'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type Mission = Database['public']['Tables']['mission_sous_traitance']['Row']
type SousTraitant = Database['public']['Tables']['sous_traitant']['Row']
type Localite = Database['public']['Tables']['localite']['Row']
type TypeConteneur = Database['public']['Tables']['type_conteneur']['Row']

interface MissionFormProps {
  mission?: Mission
  defaultSousTraitantId?: string
  onSuccess?: () => void
}

export function MissionForm({
  mission,
  defaultSousTraitantId,
  onSuccess,
}: MissionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sousTraitants, setSousTraitants] = useState<SousTraitant[]>([])
  const [localites, setLocalites] = useState<Localite[]>([])
  const [typeConteneurs, setTypeConteneurs] = useState<TypeConteneur[]>([])
  const isEditing = Boolean(mission)

  const form = useForm<CreateMissionInput>({
    resolver: zodResolver(createMissionSchema),
    defaultValues: {
      sous_traitant_id: mission?.sous_traitant_id || defaultSousTraitantId || '',
      date_mission: mission?.date_mission
        ? new Date(mission.date_mission)
        : new Date(),
      localite_depart_id: mission?.localite_depart_id || '',
      localite_arrivee_id: mission?.localite_arrivee_id || '',
      type_conteneur_id: mission?.type_conteneur_id || '',
      numero_conteneur: mission?.numero_conteneur || '',
      quantite: mission?.quantite || 1,
      montant_total: mission?.montant_total ? Number(mission.montant_total) : 0,
      statut: (mission?.statut as 'en_cours' | 'terminee' | 'annulee') || 'en_cours',
      observations: mission?.observations || '',
    },
  })

  // Charger les données du formulaire
  useEffect(() => {
    const loadFormData = async () => {
      const supabase = createClient()

      const [sousTraitantsData, localitesData, typeConteneursData] =
        await Promise.all([
          supabase
            .from('sous_traitant')
            .select('*')
            .eq('statut', 'actif')
            .order('nom_entreprise'),
          supabase.from('localite').select('*').order('nom'),
          supabase.from('type_conteneur').select('*').order('taille_pieds'),
        ])

      if (sousTraitantsData.data) setSousTraitants(sousTraitantsData.data)
      if (localitesData.data) setLocalites(localitesData.data)
      if (typeConteneursData.data) setTypeConteneurs(typeConteneursData.data)
    }

    loadFormData()
  }, [])

  const onSubmit = async (data: CreateMissionInput) => {
    try {
      setLoading(true)

      if (isEditing) {
        const result = await updateMissionAction({
          id: mission!.id,
          data,
        })

        if (result?.data) {
          toast.success('Mission modifiée avec succès')
          if (onSuccess) {
            onSuccess()
          } else {
            router.push(`/sous-traitance/missions/${mission!.id}`)
          }
        }
      } else {
        const result = await createMissionAction(data)

        if (result?.data) {
          toast.success('Mission créée avec succès')
          form.reset()
          if (onSuccess) {
            onSuccess()
          } else {
            router.push('/sous-traitance/missions')
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

  // Calculer 90% et 10% du montant total
  const montantTotal = form.watch('montant_total')
  const montant90 = montantTotal * 0.9
  const montant10 = montantTotal * 0.1

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Sous-traitant */}
          <FormField
            control={form.control}
            name="sous_traitant_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sous-traitant *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isEditing || Boolean(defaultSousTraitantId)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un sous-traitant" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sousTraitants.map((st) => (
                      <SelectItem key={st.id} value={st.id}>
                        {st.nom_entreprise}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date mission */}
          <FormField
            control={form.control}
            name="date_mission"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de mission *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      locale={fr}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Localité départ */}
          <FormField
            control={form.control}
            name="localite_depart_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Départ *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le départ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {localites.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.nom}
                        {loc.region && ` (${loc.region})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Localité arrivée */}
          <FormField
            control={form.control}
            name="localite_arrivee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arrivée *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'arrivée" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {localites.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.nom}
                        {loc.region && ` (${loc.region})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type conteneur */}
          <FormField
            control={form.control}
            name="type_conteneur_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de conteneur *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {typeConteneurs.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Numéro conteneur */}
          <FormField
            control={form.control}
            name="numero_conteneur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro conteneur</FormLabel>
                <FormControl>
                  <Input placeholder="ABCD1234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quantité */}
          <FormField
            control={form.control}
            name="quantite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantité *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Entre 1 et 20 conteneurs</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Montant total */}
          <FormField
            control={form.control}
            name="montant_total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant total (XOF) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Avance (90%): {montant90.toLocaleString('fr-FR')} XOF •
                  Solde (10%): {montant10.toLocaleString('fr-FR')} XOF
                </FormDescription>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="terminee">Terminée</SelectItem>
                    <SelectItem value="annulee">Annulée</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Observations */}
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Observations</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Notes complémentaires..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Maximum 1000 caractères</FormDescription>
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
