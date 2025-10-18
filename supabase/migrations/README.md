# Database Migrations

SQL migration files for Supabase database schema.

## Migration Strategy

Migrations will be created and applied using the Supabase MCP server.

## Planned Migrations (Phase 1)

### Core Tables
1. **LOCALITE** - Cities and regions
2. **TYPE_CONTENEUR** - Container types (20'/40'/45')
3. **CHAUFFEUR** - Driver profiles
4. **VEHICULE** - Fleet vehicles
5. **TRAJET** - Trip records
6. **CONTENEUR_TRAJET** - Trip-container junction
7. **SOUS_TRAITANT** - Subcontractors
8. **MISSION_SOUS_TRAITANCE** - Subcontractor missions

### Security
- Row Level Security (RLS) policies for each table
- Role-based access control (admin, gestionnaire, chauffeur, personnel)

### Data
- Seed data for locations and container types
- Test data for development

## Reference

See `carburant_db_schema.mermaid` in project root for complete ERD.

## Usage

Migrations will be created and applied via Supabase MCP commands during Phase 1 implementation.
