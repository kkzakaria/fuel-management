'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchMissionByIdClient } from '@/lib/supabase/mission-queries-client'

/**
 * Hook pour récupérer les détails d'une mission par ID
 */
export function useMission(id: string | null) {
  const [mission, setMission] = useState<unknown>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMission = useCallback(async () => {
    if (!id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchMissionByIdClient(id)
      setMission(data)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching mission:', err)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchMission()
  }, [fetchMission])

  const refresh = useCallback(() => {
    fetchMission()
  }, [fetchMission])

  return {
    mission,
    isLoading,
    error,
    refresh,
  }
}
