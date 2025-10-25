'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  fetchMissionsEnAttentePaiementClient,
  fetchMissionsFinancialStatsClient,
} from '@/lib/supabase/mission-queries-client'

interface MissionFinancialStats {
  montant_total: number
  montant_paye: number
  montant_restant: number
  nombre_missions_en_attente: number
}

/**
 * Hook pour récupérer les missions en attente de paiement
 */
export function useMissionsEnAttentePaiement() {
  const [missions, setMissions] = useState<unknown[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMissions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchMissionsEnAttentePaiementClient()
      setMissions(data)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching missions en attente:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMissions()
  }, [fetchMissions])

  const refresh = useCallback(() => {
    fetchMissions()
  }, [fetchMissions])

  return {
    missions,
    isLoading,
    error,
    refresh,
  }
}

/**
 * Hook pour récupérer les statistiques financières globales
 */
export function useMissionFinancialStats() {
  const [stats, setStats] = useState<MissionFinancialStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchMissionsFinancialStatsClient()
      setStats(data)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching financial stats:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

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
