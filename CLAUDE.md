# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Transport Manager** is a Progressive Web App (PWA) for fleet management in Côte d'Ivoire. It digitizes manual Excel-based operations tracking for container transport, including fuel consumption, driver management, vehicle tracking, and subcontractor oversight.

**Current Status**: Early-stage Next.js project scaffold with basic Shadcn UI setup. Most domain features are yet to be implemented.

## Technology Stack

- **Framework**: Next.js 15.5.6 (App Router with Turbopack)
- **React**: v19.1.0 with Server Components (RSC)
- **Database**: Supabase (PostgreSQL) - not yet integrated
- **UI Components**: Shadcn UI (New York style) with Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables
- **Icons**: Lucide React
- **Package Manager**: pnpm (required)
- **PWA**: Planned with next-pwa (not yet installed)
- **State Management**: Planned with Zustand and Nuqs (not yet installed)
- **Server Actions**: Planned with Next Safe Action (not yet installed)

## Development Commands

```bash
# Development server with Turbopack
pnpm dev

# Production build with Turbopack
pnpm build

# Start production server
pnpm start

# Lint check
pnpm lint
```

## Database Architecture

The application uses a PostgreSQL database managed by Supabase with the following core entities:

### Primary Tables
- **CHAUFFEUR** (Drivers): Driver profiles with employment status
- **VEHICULE** (Vehicles): Fleet vehicles with fuel type and mileage tracking
- **TRAJET** (Trips): Core trip records linking drivers, vehicles, and routes
- **LOCALITE** (Locations): Cities/regions for trip origins and destinations
- **TYPE_CONTENEUR** (Container Types): Container sizes (20', 40', 45')
- **CONTENEUR_TRAJET** (Trip Containers): Links containers to specific trips
- **SOUS_TRAITANT** (Subcontractors): Partner transport companies
- **MISSION_SOUS_TRAITANCE** (Subcontractor Missions): Outsourced transport jobs with payment tracking

### Key Business Logic
- **Fuel Tracking**: Each trip calculates literage difference (`ecart_litrage`) between expected (`litrage_prevu`) and actual (`litrage_station`) fuel consumption. Alerts trigger when ecart >10L.
- **Consumption Metrics**: Automatic calculation of `consommation_au_100` (L/100km) and `prix_litre_calcule` from trip data.
- **Payment Structure**: Subcontractor missions use 90% advance (`montant_90_pourcent`) + 10% balance (`reste_10_pourcent`) payment model.
- **Container Tracking**: Multi-type container support with delivery status tracking per trip.

See `carburant_db_schema.mermaid` for complete ERD and `sql_queries_analysis.sql` for reference queries.

## Planned Architecture

The application will follow this structure (from `architecture_technique.md`):

```
app/
├── (auth)/              # Authentication routes
│   ├── login/
│   └── register/
├── (dashboard)/         # Protected dashboard routes
│   ├── page.tsx        # Main dashboard with KPIs
│   ├── trajets/        # Trip management
│   ├── chauffeurs/     # Driver management
│   ├── vehicules/      # Vehicle management
│   ├── sous-traitance/ # Subcontractor management
│   └── rapports/       # Reporting (PDF/Excel exports)
├── api/
│   ├── export-pdf/     # PDF report generation
│   └── generate-report/
└── layout.tsx

components/
├── ui/                 # Shadcn components
├── dashboard/          # Dashboard-specific components
├── forms/              # Form components
└── charts/             # Chart components

lib/
├── supabase/
│   ├── client.ts       # Browser Supabase client
│   ├── server.ts       # Server-side Supabase client
│   └── queries.ts      # Database query functions
└── utils.ts

hooks/
├── use-trajets.ts      # Trip data hooks
├── use-chauffeurs.ts   # Driver data hooks
└── use-stats.ts        # Statistics hooks

supabase/
├── migrations/         # SQL migrations
└── seed.sql           # Test data
```

## Important Configuration

### Path Aliases (tsconfig.json)
```typescript
"@/components/*" → components/*
"@/lib/*" → lib/*
"@/utils" → lib/utils
"@/ui/*" → components/ui/*
"@/hooks/*" → hooks/*
```

### Shadcn UI Configuration
- **Style**: New York
- **Base Color**: Slate
- **CSS Variables**: Enabled
- **Icon Library**: Lucide
- Components live in `components/ui/`

## User Roles & Permissions

### Administrators
- Full system access
- User management
- Data validation
- Financial reports access

### Managers/Gestionnaires
- Fleet monitoring
- Statistics and reports
- Mission planning
- Cost tracking

### Chauffeurs (Drivers)
- Trip recording
- Fuel data entry
- Personal statistics
- Mobile-first interface

### Personnel administratif
- Data entry
- Document management
- Subcontractor payment tracking

## Critical Business Rules

### Alert Thresholds
- **Fuel Variance Alert**: Triggers when `ecart_litrage` >10L between expected and actual consumption
- **Abnormal Consumption Alert**: Triggers when consumption is 30% above vehicle average
- **Cost Anomaly Alert**: Triggers for unusual route costs or fuel prices

### Offline-First Requirements
- PWA must function without internet connectivity
- Local data persistence with automatic sync on reconnection
- Critical for drivers operating in areas with unstable connections

### Reporting Requirements
- Monthly comprehensive reports (trips, costs, performance)
- Driver-specific performance reports
- Vehicle utilization reports
- Destination-based analytics
- Financial summaries (fuel + fees + subcontracting)
- Export formats: Excel (analysis) and PDF (official documents with company logo)

## Key Features To Implement

1. **Intelligent Dashboard**: Real-time KPIs with period comparisons
2. **Trip Management**: Automatic calculations, anomaly detection, multi-container tracking
3. **Container Tracking**: Type-based tracking (20'/40'/45'), delivery status, destination analytics
4. **Driver Management**: Individual statistics, rankings, performance tracking
5. **Vehicle Management**: Fleet monitoring, consumption tracking, maintenance alerts
6. **Subcontractor Management**: Mission tracking, 90/10 payment structure, document management
7. **Reports & Analytics**: Multi-format exports, graphical analysis, trend comparison

## Known Constraints

- Application targeting Côte d'Ivoire operations (French language UI)
- Must handle intermittent connectivity
- Focus on mobile accessibility for drivers
- Excel import required for migration from existing manual system
- Payment tracking critical for subcontractor transparency

## Implementation Notes

- **Supabase Integration**: Not yet configured - will need client/server setup and Row Level Security (RLS) policies
- **PWA Configuration**: next-pwa not yet installed - required for offline functionality
- **State Management**: Zustand and Nuqs libraries planned but not yet added
- **Server Actions**: Next Safe Action for form handling security not yet integrated
- **Localization**: French language support will be primary requirement
