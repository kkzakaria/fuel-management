-- Migration: Add Missing Indexes for Performance
-- Description: Add missing index on foreign key to improve query performance
-- Issue: Unindexed Foreign Keys (1 instance on mission_sous_traitance)
-- Priority: INFO - Performance optimization
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

-- Add missing index on type_conteneur_id foreign key in mission_sous_traitance
CREATE INDEX IF NOT EXISTS idx_mission_st_type_conteneur_fkey
  ON public.mission_sous_traitance(type_conteneur_id);

-- Add comment to explain the index purpose
COMMENT ON INDEX idx_mission_st_type_conteneur_fkey IS
  'Index on type_conteneur_id foreign key to improve JOIN performance with type_conteneur table. Recommended by Supabase linter.';

-- Note: The following indexes are currently unused according to Supabase advisor.
-- They are kept for now as the application is in development with low data volume.
-- Monitor usage in production and consider removing if they remain unused:
--
-- Unused indexes to monitor:
-- - idx_localite_nom
-- - idx_localite_region
-- - idx_trajet_localite_depart
-- - idx_conteneur_trajet_type
-- - idx_conteneur_trajet_numero
-- - idx_mission_st_localite_depart
-- - idx_mission_st_localite_arrivee
-- - idx_mission_st_statut
-- - idx_mission_st_paiement
-- - idx_profiles_email
-- - idx_profiles_chauffeur
-- - idx_profiles_active
--
-- To check index usage in production, run:
-- SELECT schemaname, tablename, indexname, idx_scan
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- AND idx_scan = 0
-- ORDER BY relname, indexrelname;
