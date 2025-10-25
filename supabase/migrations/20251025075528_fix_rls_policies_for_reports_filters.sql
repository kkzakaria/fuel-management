-- Migration: fix_rls_policies_for_reports_filters
-- Description: Add RLS policies to allow authenticated users to read CHAUFFEUR and VEHICULE for reports filters
-- Author: Claude Code
-- Date: 2025-10-25
--
-- Problem: Report filter dropdowns (chauffeurs, vehicules, destinations) cannot load data
-- because existing RLS policies are too restrictive for client-side queries.
--
-- Solution: Add permissive SELECT policies for authenticated users to enable
-- read-only access to these tables for dropdown population in reports filters.

-- =====================================================
-- CHAUFFEUR TABLE - Additional SELECT policy
-- =====================================================

-- Allow all authenticated users to view active drivers (for reports filters)
-- This policy is safe because it only grants READ access, not write
CREATE POLICY "Authenticated users can view active CHAUFFEUR for filters"
  ON public.CHAUFFEUR FOR SELECT
  TO authenticated
  USING (statut = 'actif');

COMMENT ON POLICY "Authenticated users can view active CHAUFFEUR for filters" ON public.CHAUFFEUR IS
'Allows all authenticated users to read active drivers for populating report filter dropdowns. Read-only access is safe and necessary for UI functionality.';

-- =====================================================
-- VEHICULE TABLE - Additional SELECT policy
-- =====================================================

-- Allow all authenticated users to view active vehicles (for reports filters)
-- This policy is safe because it only grants READ access, not write
CREATE POLICY "Authenticated users can view active VEHICULE for filters"
  ON public.VEHICULE FOR SELECT
  TO authenticated
  USING (statut = 'actif');

COMMENT ON POLICY "Authenticated users can view active VEHICULE for filters" ON public.VEHICULE IS
'Allows all authenticated users to read active vehicles for populating report filter dropdowns. Read-only access is safe and necessary for UI functionality.';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Note: LOCALITE table already has permissive SELECT policy:
-- "Authenticated users can view LOCALITE" (line 53-56 in 20250118000003_create_rls_policies.sql)
-- So destinations dropdown should work once this migration is applied.

-- After applying this migration, the following queries should work for all authenticated users:
-- SELECT id, nom, prenom FROM CHAUFFEUR WHERE statut = 'actif' ORDER BY nom;
-- SELECT id, immatriculation, marque, modele FROM VEHICULE WHERE statut = 'actif' ORDER BY immatriculation;
-- SELECT id, nom, region FROM LOCALITE ORDER BY nom;
