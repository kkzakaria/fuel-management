'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchSousTraitantsClient } from '@/lib/supabase/sous-traitant-queries-client'
import type { SousTraitantFilters } from '@/lib/validations/sous-traitant'
import type { Database } from '@/lib/supabase/database.types'

type SousTraitant = Database['public']['Tables']['sous_traitant']['Row']

/**
 * Hook pour récupérer et gérer la liste des sous-traitants
 */
export function useSousTraitants() {
  const [sousTraitants, setSousTraitants] = useState<SousTraitant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<SousTraitantFilters>({
    search: '',
    statut: 'tous',
  })

  const fetchSousTraitants = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchSousTraitantsClient(filters)
      setSousTraitants(data)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching sous-traitants:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchSousTraitants()
  }, [fetchSousTraitants])

  const updateFilters = useCallback((newFilters: Partial<SousTraitantFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ search: '', statut: 'tous' })
  }, [])

  const refresh = useCallback(() => {
    fetchSousTraitants()
  }, [fetchSousTraitants])

  return {
    sousTraitants,
    isLoading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refresh,
  }
}
