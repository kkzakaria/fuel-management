'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchSousTraitantByIdClient } from '@/lib/supabase/sous-traitant-queries-client'

/**
 * Hook pour récupérer les détails d'un sous-traitant par ID
 */
export function useSousTraitant(id: string | null) {
  const [sousTraitant, setSousTraitant] = useState<unknown>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSousTraitant = useCallback(async () => {
    if (!id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchSousTraitantByIdClient(id)
      setSousTraitant(data)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching sous-traitant:', err)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchSousTraitant()
  }, [fetchSousTraitant])

  const refresh = useCallback(() => {
    fetchSousTraitant()
  }, [fetchSousTraitant])

  return {
    sousTraitant,
    isLoading,
    error,
    refresh,
  }
}
