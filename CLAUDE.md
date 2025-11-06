# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Transport Manager** is a Progressive Web App (PWA) for fleet management in Côte d'Ivoire. It digitizes manual Excel-based operations tracking for container transport, including fuel consumption, driver management, vehicle tracking, and subcontractor oversight.

**Current Status**: Phase 7 complete (80% overall). All core modules implemented: Dashboard, trips, drivers, vehicles, subcontractors, reports. PWA offline mode active. Next: Phase 8 (optimization & deployment).

## Technology Stack

- **Framework**: Next.js 15.5.6 (App Router with Turbopack)
- **React**: v19.1.0 with Server Components (RSC)
- **Database**: Supabase (PostgreSQL) ✅ Fully configured
- **UI Components**: Shadcn UI (New York style) with Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables
- **Icons**: Lucide React
- **Package Manager**: pnpm (required)
- **PWA**: @ducanh2912/next-pwa ✅ Configured
- **State Management**: Zustand + Nuqs v2.7.2 ✅ Fully integrated (6 pages migrated)
- **Server Actions**: Next Safe Action ✅ Installed
- **Forms**: React Hook Form + Zod + @hookform/resolvers
- **Charts**: Recharts
- **Exports**: jsPDF + xlsx
- **Date Utils**: date-fns

## Development Commands

```bash
# Development server with Turbopack
pnpm dev

# Production build with Turbopack
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check

# Lint check
pnpm lint

# Run lint-staged (pre-commit validation)
pnpm lint-staged
```

## Project Architecture

### Implemented Structure (Phases 0-4)

```
app/
├── (auth)/                    # ✅ Authentication
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/               # ✅ Protected dashboard
│   ├── page.tsx              # Main dashboard with KPIs
│   ├── trajets/              # ✅ Trip management (CRUD)
│   │   ├── page.tsx
│   │   ├── nouveau/page.tsx
│   │   ├── [id]/page.tsx
│   │   └── [id]/modifier/page.tsx
│   ├── chauffeurs/           # ✅ Driver management (CRUD)
│   │   ├── page.tsx
│   │   ├── nouveau/page.tsx
│   │   ├── [id]/page.tsx
│   │   └── [id]/modifier/page.tsx
│   ├── vehicules/            # ✅ Vehicle management (CRUD)
│   │   ├── page.tsx
│   │   ├── nouveau/page.tsx
│   │   ├── [id]/page.tsx
│   │   └── [id]/modifier/page.tsx
│   ├── sous-traitance/       # ⏳ Phase 5 - Planned
│   └── rapports/             # ⏳ Phase 6 - Planned
├── api/                       # ⏳ Planned
└── layout.tsx

components/
├── ui/                        # ✅ Shadcn components
├── auth/                      # ✅ Login/register forms
├── dashboard/                 # ✅ KPI cards, charts, layout
├── layout/                    # ✅ Sidebar, header, bottom-nav
├── trajets/                   # ✅ Trip components
├── chauffeurs/                # ✅ Driver components
└── vehicules/                 # ✅ Vehicle components

lib/
├── supabase/
│   ├── client.ts             # ✅ Browser client
│   ├── server.ts             # ✅ Server client
│   ├── queries.ts            # ✅ Base queries (28 functions)
│   ├── types.ts              # ✅ Manual types
│   ├── database.types.ts     # ✅ Auto-generated types
│   ├── dashboard-queries*.ts # ✅ Dashboard queries
│   ├── alerts-queries*.ts    # ✅ Alerts queries
│   ├── trajet-queries*.ts    # ✅ Trip queries
│   ├── chauffeur-*.ts        # ✅ Driver queries/stats
│   └── vehicule-*.ts         # ✅ Vehicle queries/stats
├── actions/
│   ├── auth.ts               # ✅ Auth server actions
│   ├── trajets.ts            # ✅ Trip server actions
│   ├── chauffeurs.ts         # ✅ Driver server actions
│   └── vehicules.ts          # ✅ Vehicle server actions
├── validations/
│   ├── trajet.ts             # ✅ Trip validation schemas
│   ├── chauffeur.ts          # ✅ Driver validation schemas
│   └── vehicule.ts           # ✅ Vehicle validation schemas
├── nuqs/                      # ✅ URL state management
│   ├── serializers/          # Custom type validators
│   │   ├── date.ts           # ISO 8601 date parsing
│   │   ├── uuid.ts           # UUID v4 validation
│   │   └── enum.ts           # Type-safe enum factory
│   ├── parsers/              # Page-specific URL schemas
│   │   ├── trajet.ts         # 9 trip parameters
│   │   ├── rapport.ts        # 7 report parameters
│   │   ├── vehicule.ts       # 5 vehicle parameters
│   │   ├── chauffeur.ts      # 4 driver parameters
│   │   ├── sous-traitant.ts  # 3 subcontractor parameters
│   │   └── mission.ts        # 6 mission parameters
│   ├── hooks.ts              # Reusable URL parameter hooks
│   └── search-params.ts      # Centralized parser exports
├── utils/                     # ✅ Utilities
│   ├── auth.ts               # Server-side auth utils
│   └── auth-client.ts        # Client-side auth hooks
├── dashboard-types.ts         # ✅ Dashboard types
├── date-utils.ts              # ✅ Date formatting
└── format-utils.ts            # ✅ XOF formatting

hooks/
├── use-stats.ts               # ✅ Dashboard stats
├── use-container-stats.ts     # ✅ Container stats
├── use-fuel-stats.ts          # ✅ Fuel stats
├── use-alerts.ts              # ✅ Alerts with auto-refresh
├── use-trajets.ts             # ✅ Trip list with filters
├── use-trajet.ts              # ✅ Single trip details
├── use-trajet-form-data.ts    # ✅ Form data loading
├── use-chauffeurs.ts          # ✅ Driver list
├── use-chauffeur.ts           # ✅ Driver details
├── use-chauffeur-stats.ts     # ✅ Driver statistics
├── use-vehicules.ts           # ✅ Vehicle list
├── use-vehicule.ts            # ✅ Vehicle details
├── use-vehicule-stats.ts      # ✅ Vehicle statistics
└── use-user-role.ts           # ✅ Role-based access control

supabase/migrations/           # ✅ 12 migrations applied
├── 20250118000001_create_initial_schema.sql
├── 20250118000002_create_profiles_and_auth.sql
├── 20250118000003_create_rls_policies.sql
├── 20250118000004_seed_data.sql
├── 20250118000005_seed_test_users.sql
├── 20251018195058_remote_schema.sql
├── 20251025075528_fix_rls_policies_for_reports_filters.sql
├── 20251106131934_fix_function_search_path_security.sql      # 🔐 Security
├── 20251106132013_fix_rls_auth_uid_performance.sql           # ⚡ Performance
├── 20251106132031_consolidate_multiple_permissive_policies.sql # ⚡ Performance
├── 20251106132120_add_missing_indexes_performance.sql        # ⚡ Performance
└── 20251106132702_fix_consolidated_policies_auth_uid.sql     # ⚡ Performance
```

## Database Architecture

The application uses PostgreSQL via Supabase with **9 tables** and **23 optimized RLS policies** (consolidated from 68).

### Recent Security & Performance Optimizations (2025-11-06)

**🔐 Security Fixes**:

- ✅ 8 functions secured against SQL injection (search_path configured)
- ✅ All critical security vulnerabilities resolved

**⚡ Performance Improvements**:

- ✅ RLS policies consolidated: 68 → 23 policies (-66%)
- ✅ All `auth.uid()` calls optimized with SELECT subqueries
- ✅ Missing foreign key indexes added
- ✅ Estimated performance gain: +60-80% on RLS queries

**📊 Current Status**:

- 🔴 Critical security issues: 0
- ⚠️ Performance issues: 0 (16 unused indexes normal in dev)
- ℹ️ Auth configuration pending: MFA + password protection (manual Dashboard config)

### Core Tables

1. **LOCALITE** (Locations): 64 cities in Côte d'Ivoire + borders + ports
2. **TYPE_CONTENEUR** (Container Types): 4 types (20', 40', 40'HC, 45'HC)
3. **CHAUFFEUR** (Drivers): Driver profiles with employment status
4. **VEHICULE** (Vehicles): Fleet vehicles with fuel type and mileage tracking
5. **TRAJET** (Trips): Core trip records with automatic calculations
6. **CONTENEUR_TRAJET** (Trip Containers): Links containers to specific trips
7. **SOUS_TRAITANT** (Subcontractors): Partner transport companies
8. **MISSION_SOUS_TRAITANCE** (Subcontractor Missions): Outsourced jobs with 90/10 payment tracking
9. **profiles** (Auth Profiles): User authentication with 4 roles

### Automatic Calculations (Generated Columns)

The database performs automatic calculations via generated columns and triggers:

- `parcours_total` = km_retour - km_depart (total distance)
- `ecart_litrage` = litrage_station - litrage_prevu (fuel variance)
- `montant_carburant` = litrage_station × prix_litre (fuel cost)
- `consommation_au_100` = (litrage_station / parcours_total) × 100 (consumption per 100km)
- `prix_litre_calcule` = montant_carburant / litrage_station (calculated price per liter)
- `cout_total` = montant_carburant + frais_peage + autres_frais (total trip cost)

### Key Business Rules

**Fuel Alerts**:

- Écart litrage >10L triggers fuel variance alert (orange badge)
- Consumption >30% above vehicle average triggers abnormal consumption alert (red badge)

**Payment Structure** (Subcontractors):

- `montant_90_pourcent` = cout_transport × 0.9 (90% advance)
- `reste_10_pourcent` = cout_transport × 0.1 (10% balance)
- `statut_paiement`: en_attente, partiel, complet

**Container Tracking**:

- Multi-type support (20', 40', 40'HC, 45'HC)
- Delivery status per container (en_transit, livre, retourne)
- Max 20 containers per trip

## Authentication & Authorization

### User Roles (4 roles)

1. **admin**: Full system access, user management, all CRUD operations
2. **gestionnaire**: Fleet monitoring, statistics, reports, CRUD (drivers/vehicles/trips)
3. **chauffeur**: Personal trip recording, fuel data entry, personal statistics (read-only)
4. **personnel**: Data entry, subcontractor payment tracking (limited access)

### Middleware Protection

The `middleware.ts` file protects routes with:

- Authentication check (redirect to /login if not authenticated)
- Account active check (auto-logout if disabled)
- Role-based access (e.g., /register is admin-only)
- Automatic redirect for authenticated users accessing /login

### RLS Policies (38 policies)

Row Level Security policies enforce data access at the database level:

- Admins: Full access to all tables
- Gestionnaires: Read access to all, write access to operational tables
- Chauffeurs: Only their own trips (filtered by `chauffeur_id`)
- Personnel: Limited to subcontractor missions and payments

## Path Aliases (tsconfig.json)

```typescript
"@/*" → "./*"
// Examples:
"@/components/ui/button" → "components/ui/button"
"@/lib/supabase/client" → "lib/supabase/client"
"@/hooks/use-stats" → "hooks/use-stats"
```

## Important Patterns

### Client vs Server Queries

**Critical separation to avoid "next/headers in Client Component" errors:**

- **Server queries**: Used in Server Components, Route Handlers, Server Actions
  - Files: `*-queries.ts` (no suffix)
  - Import: `import { createClient } from '@/lib/supabase/server'`
  - Example: `dashboard-queries.ts`, `alerts-queries.ts`

- **Client queries**: Used in Client Components, React hooks
  - Files: `*-queries-client.ts` (client suffix)
  - Import: `import { createClient } from '@/lib/supabase/client'`
  - Example: `dashboard-queries-client.ts`, `trajet-queries-client.ts`

### Server Actions with Next Safe Action

All mutations use `next-safe-action` for validation and security:

```typescript
import { authActionClient } from "@/lib/safe-action";

export const createTrajet = authActionClient
  .schema(createTrajetSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();
    // Perform mutation with validated input
    // ctx.userId available for authorization
  });
```

### Validation with Zod

All forms use Zod schemas in `lib/validations/`:

- `createTrajetSchema`: Full validation for trip creation
- `updateTrajetSchema`: Partial validation for trip updates
- Business rules enforced (e.g., km_fin > km_debut, localités différentes)

### Hooks Pattern

React hooks follow consistent patterns:

- **List hooks**: Filtering, pagination, auto-refresh (e.g., `use-trajets.ts`)
- **Detail hooks**: Single entity with relations (e.g., `use-trajet.ts`)
- **Stats hooks**: Aggregated statistics (e.g., `use-chauffeur-stats.ts`)
- **Form data hooks**: Load dropdown data (e.g., `use-trajet-form-data.ts`)

### URL State Management with Nuqs

**Nuqs v2.7.2** is used for type-safe URL search parameter management:

#### Infrastructure (`lib/nuqs/`)

```typescript
// Serializers: Custom validation for complex types
lib/nuqs/serializers/
├── date.ts      // ISO 8601 parsing with validation
├── uuid.ts      // UUID v4 validation with regex
└── enum.ts      // Type-safe enum factory

// Parsers: Page-specific URL parameter definitions
lib/nuqs/parsers/
├── trajet.ts    // 9 parameters (chauffeurId, vehiculeId, etc.)
├── rapport.ts   // 7 parameters (reportType, dateFrom, etc.)
├── vehicule.ts  // 5 parameters (statut, type_carburant, etc.)
└── chauffeur.ts // 4 parameters (statut, search, etc.)
```

#### Usage Pattern

All list hooks use Nuqs for automatic URL persistence:

```typescript
import { useQueryStates } from "nuqs";
import {
  trajetSearchParams,
  trajetSearchParamsToFilters,
} from "@/lib/nuqs/parsers/trajet";

export function useTrajets(options?: UseTrajetsOptions) {
  // Read/write URL parameters with type safety
  const [searchParams, setSearchParams] = useQueryStates(trajetSearchParams, {
    history: "push",
    shallow: true,
  });

  // Convert to API-compatible format (camelCase → snake_case)
  const filters = useMemo(
    () => trajetSearchParamsToFilters(searchParams),
    [searchParams]
  );

  // Update filters (automatically updates URL)
  const updateFilters = (newFilters: Partial<Filters>) => {
    setSearchParams({ ...newFilters, page: 1 });
  };

  return { filters, updateFilters, ...rest };
}
```

#### Key Features

- **Bookmarkable URLs**: Filter state is preserved in URL
- **Type Safety**: Full TypeScript validation for all parameters
- **Validation**: Invalid values (malformed UUIDs, dates, enums) are automatically rejected
- **Compatibility Layer**: camelCase (Nuqs) → snake_case (API) conversion
- **Navigation**: Simplified routing - `router.push("/page")` preserves URL params automatically

#### Required Setup

**Critical**: `NuqsAdapter` must wrap the app in `app/layout.tsx`:

```typescript
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          <NuqsAdapter>
            {children}
          </NuqsAdapter>
        </QueryProvider>
      </body>
    </html>
  );
}
```

**Testing**: See `docs/NUQS_MIGRATION_TESTS.md` for comprehensive test results

### Component Organization

- **Forms**: Unified create/edit forms (e.g., `chauffeur-form.tsx` for both creation and modification)
- **Details**: Tab-based details pages (e.g., 3 tabs for drivers, 404 tabs for vehicles)
- **Tables/Cards**: List views with navigation (table rows or cards clickable → details page)
- **Filters**: Advanced filtering components (e.g., `trajet-filters.tsx`)

## Code Quality Standards

### Pre-commit Validation

The project uses **Husky + lint-staged** to enforce quality before commits:

```bash
# Automatic checks on git commit:
1. ESLint with auto-fix (*.ts, *.tsx, *.js, *.jsx)
2. TypeScript type-check (pnpm tsc --noEmit)
3. Prettier formatting (*.json, *.md)
```

**Commits are blocked if**:

- TypeScript errors exist
- ESLint errors cannot be auto-fixed

### TypeScript Strict Mode

12 strict options enabled (see `tsconfig.json`):

- `strict: true`
- `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`
- `noUnusedLocals`, `noUnusedParameters`
- `noImplicitReturns`, `noFallthroughCasesInSwitch`
- `noUncheckedIndexedAccess`, `noImplicitOverride`
- `noPropertyAccessFromIndexSignature`

### Current Status

- ✅ TypeScript: **0 errors**
- ✅ ESLint: **0 errors**
- ✅ All pre-commit hooks passing

## Supabase CLI Integration

### Generate Types

```bash
# Generate TypeScript types from database schema
supabase gen types typescript --linked > lib/supabase/database.types.ts
```

### Apply Migrations

```bash
# Apply pending migrations to linked project
supabase db push --linked
```

### Check Migration Status

```bash
# List applied migrations
supabase migration list --linked
```

## French Localization

The application targets **Côte d'Ivoire** operations with French UI:

- **Currency**: XOF (West African CFA franc) formatted with `fr-FR` locale
- **Dates**: French date formatting via `date-fns` and `fr-FR` locale
- **Phone**: Ivorian format (+225 XX XX XX XX XX)
- **Language**: All UI text in French
- **Error messages**: French validation messages in Zod schemas

### Formatting Utilities

```typescript
// lib/format-utils.ts
formatCurrency(12500); // "12 500 XOF"
formatNumber(1234.56); // "1 234,56"

// lib/date-utils.ts
formatDate(new Date()); // "18 oct. 2025"
formatDateTime(new Date()); // "18 oct. 2025 à 14:30"
```

## Offline-First Requirements

**Critical for Côte d'Ivoire operations** due to unstable connectivity:

- PWA configured with @ducanh2912/next-pwa (manifest.json ready)
- Service Worker auto-generated (gitignored)
- Offline functionality planned for Phase 7
- Local persistence with automatic sync on reconnection
- Essential for drivers in areas with poor network coverage

## Testing & Validation

### Manual Testing Process

Each phase includes comprehensive manual testing documented in:

- `docs/PHASE2_TEST_FINAL.md` (Dashboard tests)
- `docs/TESTS_PHASE3.md` (Trip management tests)
- Phase 4 tests documented in completion reports

### Test Coverage Areas

1. **Authentication**: Login/logout, role-based access
2. **Dashboard**: KPIs, charts, period selector, alerts
3. **CRUD Operations**: Create, read, update, delete for all entities
4. **Filtering & Pagination**: Advanced filters, 20 items per page
5. **Calculations**: Automatic fuel/cost calculations validation
6. **Alerts**: Fuel variance and abnormal consumption triggers
7. **Responsive Design**: Desktop sidebar + mobile bottom nav
8. **Error Handling**: Graceful 404 handling for future APIs

## Implementation Status (Phase 7 Complete - 80%)

### ✅ Completed Features

**Phase 0**: Project setup, Supabase configuration, PWA setup
**Phase 1**: Database migrations (9 tables), authentication (4 roles), RLS policies (38), seed data
**Phase 2**: Dashboard with 4 KPIs, 4 interactive charts (Recharts), navigation, alerts
**Phase 3**: Trip management (CRUD), automatic calculations, alerts, container tracking, pagination
**Phase 4**: Driver management (CRUD), vehicle management (CRUD), statistics, role-based access
**Phase 5**: Subcontractor management (CRUD), 90/10 payment tracking, missions, financial stats
**Phase 6**: Reports & exports (PDF/Excel), 5 report types, filters, preview
**Phase 7**: PWA offline mode, service worker configured, responsive design

### ⏳ Remaining Features

**Phase 8** (Current - 10%): Performance optimization, testing suite, deployment preparation, Excel import tool
**Phase 9** (Planned): User feedback integration, advanced analytics
**Phase 10** (Planned): Mobile app optimization, push notifications

## Known Constraints

- **Target Region**: Côte d'Ivoire (French UI, XOF currency, +225 phone format)
- **Connectivity**: Must handle intermittent internet (PWA critical)
- **Mobile-First**: Drivers primarily use mobile devices
- **Excel Migration**: Required for transitioning from existing manual system
- **Payment Transparency**: Subcontractor payment tracking is business-critical

## Critical Business Metrics

### Alert Thresholds

- **Fuel Variance**: `ecart_litrage` >10L (orange badge)
- **Abnormal Consumption**: >30% above vehicle average (red badge)
- **Cost Anomaly**: Unusual route costs or fuel prices (future)

### Auto-Refresh

- Dashboard alerts: 60 seconds
- Statistics hooks: Manual refresh available
- Real-time data critical for fleet monitoring

## Development Notes

### Common Patterns to Follow

1. **Create/Edit Forms**: Use single unified component with `isEditMode` flag
2. **Navigation**: Table rows and cards should be clickable (navigate to details)
3. **RBAC Buttons**: Use `use-user-role.ts` hook for conditional rendering (e.g., "Nouveau" button)
4. **Validation**: Centralize Zod schemas in `lib/validations/`
5. **Queries**: Separate client/server query files to avoid React errors
6. **Auto-calculations**: Rely on database generated columns, don't duplicate in UI
7. **Error Handling**: Use `console.debug()` for expected 404s (future APIs), not `console.error()`

### File Naming Conventions

- Client queries: `*-queries-client.ts`
- Server queries: `*-queries.ts` (no suffix)
- Validations: `lib/validations/*.ts`
- Actions: `lib/actions/*.ts`
- Hooks: `hooks/use-*.ts`
- Components: PascalCase directory + kebab-case files (`components/trajets/trajet-form.tsx`)

### Supabase Query Optimization

- Use `.select()` with specific columns, avoid `SELECT *`
- Join related tables in single query (e.g., trajet with chauffeur, vehicule, localités)
- Add indexes for frequently filtered columns (already configured in migrations)
- Use RLS policies instead of application-level filtering

## Documentation References

- **Development Plan**: `PLAN_DEVELOPPEMENT.md` (comprehensive roadmap, 50% complete)
- **Database Schema**: `carburant_db_schema.mermaid` (ERD diagram)
- **Architecture**: `architecture_technique.md` (technical structure)
- **Quality Checks**: `docs/QUALITY_CHECKS.md` (TypeScript strict, Husky, lint-staged)
- **Phase Completion Reports**: `docs/PHASE{0-4}_COMPLETE.md`

## Next Steps

**Immediate Priority**: Phase 5 - Subcontractor Management

- CRUD for subcontractors (SOUS_TRAITANT table)
- Mission management with 90/10 payment structure
- Document upload (EIR, return receipts)
- Payment status tracking (en_attente, partiel, complet)
- Financial dashboard for outstanding payments
