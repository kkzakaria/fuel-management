'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchMissionsClient } from '@/lib/supabase/mission-queries-client'
import type { MissionFilters } from '@/lib/validations/mission'
import type { Database } from '@/lib/supabase/database.types'

type Mission = Database['public']['Tables']['mission_sous_traitance']['Row']

/**
 * Hook pour récupérer et gérer la liste des missions avec pagination
 */
export function useMissions(initialPage = 1, initialPageSize = 20) {
  const [missions, setMissions] = useState<Mission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(initialPage)
  const [pageSize] = useState(initialPageSize)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<MissionFilters>({
    search: '',
    statut: 'tous',
    statut_paiement: 'tous',
  })

  const fetchMissions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchMissionsClient(filters, page, pageSize)
      setMissions(data.missions)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching missions:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters, page, pageSize])

  useEffect(() => {
    fetchMissions()
  }, [fetchMissions])

  const updateFilters = useCallback((newFilters: Partial<MissionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPage(1) // Reset to first page when filters change
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      statut: 'tous',
      statut_paiement: 'tous',
    })
    setPage(1)
  }, [])

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage((prev) => prev + 1)
    }
  }, [page, totalPages])

  const previousPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1)
    }
  }, [page])

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }, [totalPages])

  const refresh = useCallback(() => {
    fetchMissions()
  }, [fetchMissions])

  return {
    missions,
    isLoading,
    error,
    page,
    pageSize,
    totalPages,
    total,
    filters,
    updateFilters,
    clearFilters,
    nextPage,
    previousPage,
    goToPage,
    refresh,
  }
}
