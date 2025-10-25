/**
 * Composant Filtres pour la liste des sous-traitants
 */

'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { SousTraitantFilters } from '@/lib/validations/sous-traitant'

interface SousTraitantFiltersProps {
  filters: SousTraitantFilters
  onFilterChange: (filters: Partial<SousTraitantFilters>) => void
  onClearFilters: () => void
}

export function SousTraitantFiltersComponent({
  filters,
  onFilterChange,
  onClearFilters,
}: SousTraitantFiltersProps) {
  const hasActiveFilters = filters.search || filters.statut !== 'tous'

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      {/* Recherche */}
      <div className="flex-1">
        <Input
          placeholder="Rechercher par nom, contact ou téléphone..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="w-full"
        />
      </div>

      {/* Filtre statut */}
      <div className="w-full md:w-[200px]">
        <Select
          value={filters.statut || 'tous'}
          onValueChange={(value) =>
            onFilterChange({
              statut: value as 'actif' | 'inactif' | 'blackliste' | 'tous',
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les statuts</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="inactif">Inactif</SelectItem>
            <SelectItem value="blackliste">Blacklisté</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bouton réinitialiser */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={onClearFilters} size="icon">
          <X className="h-4 w-4" />
          <span className="sr-only">Réinitialiser les filtres</span>
        </Button>
      )}
    </div>
  )
}

// Export par défaut pour faciliter l'import
export default SousTraitantFiltersComponent
export { SousTraitantFiltersComponent as SousTraitantFilters }
