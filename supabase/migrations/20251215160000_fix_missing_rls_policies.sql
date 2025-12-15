-- Migration: Fix Missing RLS Policies
-- Description: Restore INSERT/UPDATE/DELETE policies that were removed during consolidation
-- Author: Claude Code
-- Date: 2025-12-15
--
-- Problems Fixed:
-- 1. chauffeur: Missing INSERT/UPDATE/DELETE policies for admins/gestionnaires
-- 2. vehicule: Missing INSERT/UPDATE/DELETE policies for admins/gestionnaires
-- 3. sous_traitant: Missing INSERT/UPDATE/DELETE policies for admins/gestionnaires
-- 4. localite: Missing INSERT/UPDATE/DELETE policies for admins
-- 5. type_conteneur: Missing INSERT/UPDATE/DELETE policies for admins
-- 6. mission_sous_traitance: Missing INSERT/DELETE policies
-- 7. conteneur_trajet: Chauffeurs can't view containers for their own trips
-- 8. vehicule: Personnel can only see 'actif' but code queries 'actif' + 'maintenance'

-- ============================================================================
-- TABLE: chauffeur - Add INSERT/UPDATE/DELETE policies
-- ============================================================================

CREATE POLICY "Unified chauffeur INSERT policy"
  ON public.chauffeur
  FOR INSERT
  WITH CHECK (
    is_gestionnaire_or_admin()
  );

CREATE POLICY "Unified chauffeur UPDATE policy"
  ON public.chauffeur
  FOR UPDATE
  USING (is_gestionnaire_or_admin())
  WITH CHECK (is_gestionnaire_or_admin());

CREATE POLICY "Unified chauffeur DELETE policy"
  ON public.chauffeur
  FOR DELETE
  USING (is_admin());

COMMENT ON POLICY "Unified chauffeur INSERT policy" ON public.chauffeur IS
  'Only gestionnaires and admins can create drivers.';
COMMENT ON POLICY "Unified chauffeur UPDATE policy" ON public.chauffeur IS
  'Only gestionnaires and admins can update drivers.';
COMMENT ON POLICY "Unified chauffeur DELETE policy" ON public.chauffeur IS
  'Only admins can delete drivers (data integrity).';

-- ============================================================================
-- TABLE: vehicule - Add INSERT/UPDATE/DELETE policies
-- ============================================================================

CREATE POLICY "Unified vehicule INSERT policy"
  ON public.vehicule
  FOR INSERT
  WITH CHECK (
    is_gestionnaire_or_admin()
  );

CREATE POLICY "Unified vehicule UPDATE policy"
  ON public.vehicule
  FOR UPDATE
  USING (is_gestionnaire_or_admin())
  WITH CHECK (is_gestionnaire_or_admin());

CREATE POLICY "Unified vehicule DELETE policy"
  ON public.vehicule
  FOR DELETE
  USING (is_admin());

-- Fix SELECT policy to include 'maintenance' status for authenticated users
DROP POLICY IF EXISTS "Unified vehicule SELECT policy" ON public.vehicule;
CREATE POLICY "Unified vehicule SELECT policy"
  ON public.vehicule
  FOR SELECT
  USING (
    is_gestionnaire_or_admin() OR
    is_chauffeur() OR
    (statut IN ('actif', 'maintenance') AND (SELECT auth.role()) = 'authenticated')
  );

COMMENT ON POLICY "Unified vehicule INSERT policy" ON public.vehicule IS
  'Only gestionnaires and admins can create vehicles.';
COMMENT ON POLICY "Unified vehicule UPDATE policy" ON public.vehicule IS
  'Only gestionnaires and admins can update vehicles.';
COMMENT ON POLICY "Unified vehicule DELETE policy" ON public.vehicule IS
  'Only admins can delete vehicles (data integrity).';
COMMENT ON POLICY "Unified vehicule SELECT policy" ON public.vehicule IS
  'Gestionnaires/admins see all. Chauffeurs see all for trip forms. Others see actif/maintenance.';

-- ============================================================================
-- TABLE: sous_traitant - Add INSERT/UPDATE/DELETE policies
-- ============================================================================

CREATE POLICY "Unified sous_traitant INSERT policy"
  ON public.sous_traitant
  FOR INSERT
  WITH CHECK (
    is_gestionnaire_or_admin()
  );

CREATE POLICY "Unified sous_traitant UPDATE policy"
  ON public.sous_traitant
  FOR UPDATE
  USING (is_gestionnaire_or_admin())
  WITH CHECK (is_gestionnaire_or_admin());

CREATE POLICY "Unified sous_traitant DELETE policy"
  ON public.sous_traitant
  FOR DELETE
  USING (is_admin());

COMMENT ON POLICY "Unified sous_traitant INSERT policy" ON public.sous_traitant IS
  'Only gestionnaires and admins can create subcontractors.';
COMMENT ON POLICY "Unified sous_traitant UPDATE policy" ON public.sous_traitant IS
  'Only gestionnaires and admins can update subcontractors.';
COMMENT ON POLICY "Unified sous_traitant DELETE policy" ON public.sous_traitant IS
  'Only admins can delete subcontractors (data integrity).';

-- ============================================================================
-- TABLE: mission_sous_traitance - Add INSERT/DELETE policies
-- ============================================================================

CREATE POLICY "Unified mission_sous_traitance INSERT policy"
  ON public.mission_sous_traitance
  FOR INSERT
  WITH CHECK (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel'
  );

-- Keep existing INSERT policy from original migration if it exists
DROP POLICY IF EXISTS "Admins and gestionnaires can insert MISSION_SOUS_TRAITANCE" ON public.mission_sous_traitance;

CREATE POLICY "Unified mission_sous_traitance DELETE policy"
  ON public.mission_sous_traitance
  FOR DELETE
  USING (is_admin());

COMMENT ON POLICY "Unified mission_sous_traitance INSERT policy" ON public.mission_sous_traitance IS
  'Gestionnaires, admins, and personnel can create missions.';
COMMENT ON POLICY "Unified mission_sous_traitance DELETE policy" ON public.mission_sous_traitance IS
  'Only admins can delete missions (data integrity).';

-- ============================================================================
-- TABLE: localite - Add INSERT/UPDATE/DELETE policies for admins
-- ============================================================================

CREATE POLICY "Unified localite INSERT policy"
  ON public.localite
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Unified localite UPDATE policy"
  ON public.localite
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Unified localite DELETE policy"
  ON public.localite
  FOR DELETE
  USING (is_admin());

COMMENT ON POLICY "Unified localite INSERT policy" ON public.localite IS
  'Only admins can create locations (reference data).';
COMMENT ON POLICY "Unified localite UPDATE policy" ON public.localite IS
  'Only admins can update locations (reference data).';
COMMENT ON POLICY "Unified localite DELETE policy" ON public.localite IS
  'Only admins can delete locations (reference data).';

-- ============================================================================
-- TABLE: type_conteneur - Add INSERT/UPDATE/DELETE policies for admins
-- ============================================================================

CREATE POLICY "Unified type_conteneur INSERT policy"
  ON public.type_conteneur
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Unified type_conteneur UPDATE policy"
  ON public.type_conteneur
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Unified type_conteneur DELETE policy"
  ON public.type_conteneur
  FOR DELETE
  USING (is_admin());

COMMENT ON POLICY "Unified type_conteneur INSERT policy" ON public.type_conteneur IS
  'Only admins can create container types (reference data).';
COMMENT ON POLICY "Unified type_conteneur UPDATE policy" ON public.type_conteneur IS
  'Only admins can update container types (reference data).';
COMMENT ON POLICY "Unified type_conteneur DELETE policy" ON public.type_conteneur IS
  'Only admins can delete container types (reference data).';

-- ============================================================================
-- TABLE: conteneur_trajet - Fix SELECT to include chauffeurs for their own trips
-- ============================================================================

DROP POLICY IF EXISTS "Unified conteneur_trajet SELECT policy" ON public.conteneur_trajet;
CREATE POLICY "Unified conteneur_trajet SELECT policy"
  ON public.conteneur_trajet
  FOR SELECT
  USING (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel' OR
    EXISTS (
      SELECT 1 FROM trajet
      WHERE trajet.id = conteneur_trajet.trajet_id
      AND trajet.chauffeur_id = get_current_chauffeur_id()
    )
  );

COMMENT ON POLICY "Unified conteneur_trajet SELECT policy" ON public.conteneur_trajet IS
  'Gestionnaires/admins see all. Personnel see all. Chauffeurs see containers for their own trips.';

-- ============================================================================
-- TABLE: profiles - Fix redundant condition and add INSERT policy
-- ============================================================================

-- Recreate SELECT policy without redundancy
DROP POLICY IF EXISTS "Unified profiles SELECT policy" ON public.profiles;
CREATE POLICY "Unified profiles SELECT policy"
  ON public.profiles
  FOR SELECT
  USING (
    is_gestionnaire_or_admin() OR
    id = (SELECT auth.uid())
  );

-- INSERT policy - Allow system trigger to create profiles
-- Note: This is handled by SECURITY DEFINER function handle_new_user()
-- But we add explicit policy for admin user creation
CREATE POLICY "Unified profiles INSERT policy"
  ON public.profiles
  FOR INSERT
  WITH CHECK (is_admin());

-- DELETE policy - Only admins can delete profiles
CREATE POLICY "Unified profiles DELETE policy"
  ON public.profiles
  FOR DELETE
  USING (is_admin());

COMMENT ON POLICY "Unified profiles SELECT policy" ON public.profiles IS
  'Gestionnaires/admins see all profiles. Users see their own profile.';
COMMENT ON POLICY "Unified profiles INSERT policy" ON public.profiles IS
  'Admins can create profiles. Regular profiles created via auth trigger.';
COMMENT ON POLICY "Unified profiles DELETE policy" ON public.profiles IS
  'Only admins can delete user profiles.';

-- ============================================================================
-- GRANT missing table permissions
-- ============================================================================

-- Ensure all tables have proper GRANT permissions for RLS to work
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chauffeur TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicule TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trajet TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conteneur_trajet TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sous_traitant TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_sous_traitance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.localite TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.type_conteneur TO authenticated;

-- Read-only for anon (if needed for public pages)
GRANT SELECT ON public.localite TO anon;
GRANT SELECT ON public.type_conteneur TO anon;
