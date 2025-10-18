# React Hooks

Custom React hooks for data fetching, state management, and business logic.

## Planned Hooks

### Phase 2 - Dashboard & KPIs
- `use-stats.ts` - Dashboard statistics and KPIs
- `use-dashboard-stats.ts` - Main dashboard metrics
- `use-container-stats.ts` - Container statistics
- `use-fuel-stats.ts` - Fuel consumption metrics
- `use-alerts.ts` - Active alerts management

### Phase 3 - Trip Management
- `use-trajets.ts` - Trip CRUD operations
- `use-trajet.ts` - Single trip details
- `use-create-trajet.ts` - Create trip mutations
- `use-update-trajet.ts` - Update trip mutations
- `use-delete-trajet.ts` - Delete trip mutations

### Phase 4 - Drivers & Vehicles
- `use-chauffeurs.ts` - Driver management
- `use-vehicules.ts` - Vehicle management

### Phase 5 - Subcontracting
- `use-sous-traitants.ts` - Subcontractor operations
- `use-missions.ts` - Subcontractor mission management

## Usage Pattern

```typescript
'use client'

import { useTrajets } from '@/hooks/use-trajets'

export function TrajetsPage() {
  const { data, isLoading, error } = useTrajets()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{/* render data */}</div>
}
```
