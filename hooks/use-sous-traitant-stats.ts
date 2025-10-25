'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchSousTraitantStatsClient } from '@/lib/supabase/sous-traitant-queries-client'

interface SousTraitantStats {
  total_missions: number
  missions_en_cours: number
  missions_terminees: number
  montant_total_missions: number
  montant_paye: number
  montant_restant: number
}

/**
 * Hook pour récupérer les statistiques d'un sous-traitant
 */
export function useSousTraitantStats(id: string | null) {
  const [stats, setStats] = useState<SousTraitantStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    if (!id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchSousTraitantStatsClient(id)
      setStats(data)
    } catch (err) {
      // Gestion gracieuse des erreurs 404 (APIs futures)
      if (err instanceof Error && err.message.includes('404')) {
        console.debug('Stats endpoint not yet implemented:', err)
        setStats(null)
      } else {
        setError(err as Error)
        console.error('Error fetching sous-traitant stats:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const refresh = useCallback(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    isLoading,
    error,
    refresh,
  }
}
