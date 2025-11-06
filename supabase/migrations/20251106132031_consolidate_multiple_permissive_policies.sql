-- Migration: Consolidate Multiple Permissive Policies
-- Description: Merge multiple permissive RLS policies into single policies with OR conditions for better performance
-- Issue: Multiple Permissive Policies (68 instances across 9 tables)
-- Priority: WARN - Performance degradation (each policy executed per query)
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies

-- ============================================================================
-- TABLE: profiles
-- ============================================================================

-- Consolidate SELECT policies on profiles (3 policies  1)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Gestionnaires can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Unified profiles SELECT policy"
  ON public.profiles
  FOR SELECT
  USING (
    is_admin() OR
    is_gestionnaire_or_admin() OR
    id = (SELECT auth.uid())
  );

-- Consolidate UPDATE policies on profiles (2 policies  1)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Unified profiles UPDATE policy"
  ON public.profiles
  FOR UPDATE
  USING (
    is_admin() OR
    id = (SELECT auth.uid())
  )
  WITH CHECK (
    is_admin() OR
    id = (SELECT auth.uid())
  );

-- ============================================================================
-- TABLE: trajet
-- ============================================================================

-- Consolidate SELECT policies on trajet (3 policies  1)
DROP POLICY IF EXISTS "Admins and gestionnaires can manage all TRAJET" ON public.trajet;
DROP POLICY IF EXISTS "Admins and gestionnaires can view all TRAJET" ON public.trajet;
DROP POLICY IF EXISTS "Chauffeurs can view own TRAJET" ON public.trajet;
DROP POLICY IF EXISTS "Personnel can view TRAJET" ON public.trajet;

CREATE POLICY "Unified trajet SELECT policy"
  ON public.trajet
  FOR SELECT
  USING (
    is_gestionnaire_or_admin() OR
    (is_chauffeur() AND chauffeur_id = get_current_chauffeur_id()) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'personnel'
  );

-- Consolidate INSERT policies on trajet (2 policies  1)
DROP POLICY IF EXISTS "Chauffeurs can insert own TRAJET" ON public.trajet;
DROP POLICY IF EXISTS "Personnel can manage TRAJET" ON public.trajet;

CREATE POLICY "Unified trajet INSERT policy"
  ON public.trajet
  FOR INSERT
  WITH CHECK (
    is_gestionnaire_or_admin() OR
    (is_chauffeur() AND chauffeur_id = get_current_chauffeur_id()) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'personnel'
  );

-- Consolidate UPDATE policies on trajet (2 policies  1)
DROP POLICY IF EXISTS "Chauffeurs can update own TRAJET" ON public.trajet;

CREATE POLICY "Unified trajet UPDATE policy"
  ON public.trajet
  FOR UPDATE
  USING (
    is_gestionnaire_or_admin() OR
    (is_chauffeur() AND chauffeur_id = get_current_chauffeur_id()) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'personnel'
  )
  WITH CHECK (
    is_gestionnaire_or_admin() OR
    (is_chauffeur() AND chauffeur_id = get_current_chauffeur_id()) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'personnel'
  );

-- Consolidate DELETE policies on trajet (2 policies  1)
CREATE POLICY "Unified trajet DELETE policy"
  ON public.trajet
  FOR DELETE
  USING (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'personnel'
  );

-- ============================================================================
-- TABLE: chauffeur
-- ============================================================================

-- Consolidate SELECT policies on chauffeur (3 policies  1)
DROP POLICY IF EXISTS "Admins and gestionnaires can manage CHAUFFEUR" ON public.chauffeur;
DROP POLICY IF EXISTS "Admins and gestionnaires can view CHAUFFEUR" ON public.chauffeur;
DROP POLICY IF EXISTS "Chauffeurs can view own record" ON public.chauffeur;
DROP POLICY IF EXISTS "Authenticated users can view active CHAUFFEUR for filters" ON public.chauffeur;

CREATE POLICY "Unified chauffeur SELECT policy"
  ON public.chauffeur
  FOR SELECT
  USING (
    is_gestionnaire_or_admin() OR
    id = get_current_chauffeur_id() OR
    (statut = 'actif' AND auth.role() = 'authenticated')
  );

-- ============================================================================
-- TABLE: vehicule
-- ============================================================================

-- Consolidate SELECT policies on vehicule (3 policies  1)
DROP POLICY IF EXISTS "Admins and gestionnaires can manage VEHICULE" ON public.vehicule;
DROP POLICY IF EXISTS "Admins and gestionnaires can view VEHICULE" ON public.vehicule;
DROP POLICY IF EXISTS "Chauffeurs can view VEHICULE" ON public.vehicule;
DROP POLICY IF EXISTS "Authenticated users can view active VEHICULE for filters" ON public.vehicule;

CREATE POLICY "Unified vehicule SELECT policy"
  ON public.vehicule
  FOR SELECT
  USING (
    is_gestionnaire_or_admin() OR
    is_chauffeur() OR
    (statut = 'actif' AND auth.role() = 'authenticated')
  );

-- ============================================================================
-- TABLE: conteneur_trajet
-- ============================================================================

-- Consolidate SELECT policies on conteneur_trajet (2 policies  1)
DROP POLICY IF EXISTS "Admins and gestionnaires can manage CONTENEUR_TRAJET" ON public.conteneur_trajet;
DROP POLICY IF EXISTS "Admins and gestionnaires can view CONTENEUR_TRAJET" ON public.conteneur_trajet;
DROP POLICY IF EXISTS "Personnel can view CONTENEUR_TRAJET" ON public.conteneur_trajet;

CREATE POLICY "Unified conteneur_trajet SELECT policy"
  ON public.conteneur_trajet
  FOR SELECT
  USING (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'personnel'
  );

-- Consolidate INSERT policies on conteneur_trajet (2 policies  1)
DROP POLICY IF EXISTS "Chauffeurs can insert own CONTENEUR_TRAJET" ON public.conteneur_trajet;
DROP POLICY IF EXISTS "Personnel can manage CONTENEUR_TRAJET" ON public.conteneur_trajet;

CREATE POLICY "Unified conteneur_trajet INSERT policy"
  ON public.conteneur_trajet
  FOR INSERT
  WITH CHECK (
    is_gestionnaire_or_admin() OR
    EXISTS (
      SELECT 1 FROM trajet
      WHERE trajet.id = conteneur_trajet.trajet_id
      AND trajet.chauffeur_id = get_current_chauffeur_id()
    ) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'personnel'
  );

-- Consolidate UPDATE policies on conteneur_trajet (2 policies  1)
CREATE POLICY "Unified conteneur_trajet UPDATE policy"
  ON public.conteneur_trajet
  FOR UPDATE
  USING (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'personnel'
  )
  WITH CHECK (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'personnel'
  );

-- Consolidate DELETE policies on conteneur_trajet (2 policies  1)
CREATE POLICY "Unified conteneur_trajet DELETE policy"
  ON public.conteneur_trajet
  FOR DELETE
  USING (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'personnel'
  );

-- ============================================================================
-- TABLE: sous_traitant
-- ============================================================================

-- Consolidate SELECT policies on sous_traitant (2 policies  1)
DROP POLICY IF EXISTS "Admins and gestionnaires can manage SOUS_TRAITANT" ON public.sous_traitant;
DROP POLICY IF EXISTS "Admins and gestionnaires can view SOUS_TRAITANT" ON public.sous_traitant;
DROP POLICY IF EXISTS "Personnel can view SOUS_TRAITANT" ON public.sous_traitant;

CREATE POLICY "Unified sous_traitant SELECT policy"
  ON public.sous_traitant
  FOR SELECT
  USING (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'personnel'
  );

-- ============================================================================
-- TABLE: mission_sous_traitance
-- ============================================================================

-- Consolidate SELECT policies on mission_sous_traitance (2 policies  1)
DROP POLICY IF EXISTS "Admins and gestionnaires can view MISSION_SOUS_TRAITANCE" ON public.mission_sous_traitance;
DROP POLICY IF EXISTS "Personnel can view MISSION_SOUS_TRAITANCE" ON public.mission_sous_traitance;

CREATE POLICY "Unified mission_sous_traitance SELECT policy"
  ON public.mission_sous_traitance
  FOR SELECT
  USING (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'personnel'
  );

-- Consolidate UPDATE policies on mission_sous_traitance (2 policies  1)
DROP POLICY IF EXISTS "Admins and gestionnaires can update MISSION_SOUS_TRAITANCE" ON public.mission_sous_traitance;
DROP POLICY IF EXISTS "Personnel can update payment status" ON public.mission_sous_traitance;

CREATE POLICY "Unified mission_sous_traitance UPDATE policy"
  ON public.mission_sous_traitance
  FOR UPDATE
  USING (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'personnel'
  )
  WITH CHECK (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'personnel'
  );

-- ============================================================================
-- TABLE: localite
-- ============================================================================

-- Consolidate SELECT policies on localite (2 policies  1)
DROP POLICY IF EXISTS "Admins can manage LOCALITE" ON public.localite;
DROP POLICY IF EXISTS "Authenticated users can view LOCALITE" ON public.localite;

CREATE POLICY "Unified localite SELECT policy"
  ON public.localite
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
  );

-- ============================================================================
-- TABLE: type_conteneur
-- ============================================================================

-- Consolidate SELECT policies on type_conteneur (2 policies  1)
DROP POLICY IF EXISTS "Admins can manage TYPE_CONTENEUR" ON public.type_conteneur;
DROP POLICY IF EXISTS "Authenticated users can view TYPE_CONTENEUR" ON public.type_conteneur;

CREATE POLICY "Unified type_conteneur SELECT policy"
  ON public.type_conteneur
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
  );

-- Add comments to track this performance optimization
COMMENT ON POLICY "Unified profiles SELECT policy" ON public.profiles IS
  'Consolidated from 3 policies for better performance. Allows admins, gestionnaires, and users to view their own profile.';

COMMENT ON POLICY "Unified profiles UPDATE policy" ON public.profiles IS
  'Consolidated from 2 policies for better performance. Allows admins and users to update their own profile.';

COMMENT ON POLICY "Unified trajet SELECT policy" ON public.trajet IS
  'Consolidated from 4 policies for better performance. Allows gestionnaires, admins, chauffeurs (own), and personnel to view trips.';

COMMENT ON POLICY "Unified trajet INSERT policy" ON public.trajet IS
  'Consolidated from 3 policies for better performance. Allows gestionnaires, admins, chauffeurs (own), and personnel to create trips.';

COMMENT ON POLICY "Unified trajet UPDATE policy" ON public.trajet IS
  'Consolidated from 3 policies for better performance. Allows gestionnaires, admins, chauffeurs (own), and personnel to update trips.';

COMMENT ON POLICY "Unified trajet DELETE policy" ON public.trajet IS
  'Consolidated from 2 policies for better performance. Allows gestionnaires, admins, and personnel to delete trips.';
