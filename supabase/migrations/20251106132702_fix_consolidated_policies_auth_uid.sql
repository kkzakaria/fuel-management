-- Migration: Fix Consolidated Policies Auth UID Performance
-- Description: Wrap auth.uid() and auth.role() calls in SELECT subqueries for better performance
-- Issue: Auth RLS InitPlan (16 policies affected after consolidation)
-- Priority: WARN - Performance degradation at scale
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- Fix trajet SELECT policy
DROP POLICY IF EXISTS "Unified trajet SELECT policy" ON public.trajet;
CREATE POLICY "Unified trajet SELECT policy"
  ON public.trajet
  FOR SELECT
  USING (
    is_gestionnaire_or_admin() OR
    (is_chauffeur() AND chauffeur_id = get_current_chauffeur_id()) OR
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel'
  );

-- Fix trajet INSERT policy
DROP POLICY IF EXISTS "Unified trajet INSERT policy" ON public.trajet;
CREATE POLICY "Unified trajet INSERT policy"
  ON public.trajet
  FOR INSERT
  WITH CHECK (
    is_gestionnaire_or_admin() OR
    (is_chauffeur() AND chauffeur_id = get_current_chauffeur_id()) OR
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel'
  );

-- Fix trajet UPDATE policy
DROP POLICY IF EXISTS "Unified trajet UPDATE policy" ON public.trajet;
CREATE POLICY "Unified trajet UPDATE policy"
  ON public.trajet
  FOR UPDATE
  USING (
    is_gestionnaire_or_admin() OR
    (is_chauffeur() AND chauffeur_id = get_current_chauffeur_id()) OR
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel'
  )
  WITH CHECK (
    is_gestionnaire_or_admin() OR
    (is_chauffeur() AND chauffeur_id = get_current_chauffeur_id()) OR
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel'
  );

-- Fix trajet DELETE policy
DROP POLICY IF EXISTS "Unified trajet DELETE policy" ON public.trajet;
CREATE POLICY "Unified trajet DELETE policy"
  ON public.trajet
  FOR DELETE
  USING (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel'
  );

-- Fix chauffeur SELECT policy
DROP POLICY IF EXISTS "Unified chauffeur SELECT policy" ON public.chauffeur;
CREATE POLICY "Unified chauffeur SELECT policy"
  ON public.chauffeur
  FOR SELECT
  USING (
    is_gestionnaire_or_admin() OR
    id = get_current_chauffeur_id() OR
    (statut = 'actif' AND (SELECT auth.role()) = 'authenticated')
  );

-- Fix vehicule SELECT policy
DROP POLICY IF EXISTS "Unified vehicule SELECT policy" ON public.vehicule;
CREATE POLICY "Unified vehicule SELECT policy"
  ON public.vehicule
  FOR SELECT
  USING (
    is_gestionnaire_or_admin() OR
    is_chauffeur() OR
    (statut = 'actif' AND (SELECT auth.role()) = 'authenticated')
  );

-- Fix conteneur_trajet SELECT policy
DROP POLICY IF EXISTS "Unified conteneur_trajet SELECT policy" ON public.conteneur_trajet;
CREATE POLICY "Unified conteneur_trajet SELECT policy"
  ON public.conteneur_trajet
  FOR SELECT
  USING (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel'
  );

-- Fix conteneur_trajet INSERT policy
DROP POLICY IF EXISTS "Unified conteneur_trajet INSERT policy" ON public.conteneur_trajet;
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
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel'
  );

-- Fix conteneur_trajet UPDATE policy
DROP POLICY IF EXISTS "Unified conteneur_trajet UPDATE policy" ON public.conteneur_trajet;
CREATE POLICY "Unified conteneur_trajet UPDATE policy"
  ON public.conteneur_trajet
  FOR UPDATE
  USING (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel'
  )
  WITH CHECK (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel'
  );

-- Fix conteneur_trajet DELETE policy
DROP POLICY IF EXISTS "Unified conteneur_trajet DELETE policy" ON public.conteneur_trajet;
CREATE POLICY "Unified conteneur_trajet DELETE policy"
  ON public.conteneur_trajet
  FOR DELETE
  USING (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel'
  );

-- Fix sous_traitant SELECT policy
DROP POLICY IF EXISTS "Unified sous_traitant SELECT policy" ON public.sous_traitant;
CREATE POLICY "Unified sous_traitant SELECT policy"
  ON public.sous_traitant
  FOR SELECT
  USING (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel'
  );

-- Fix mission_sous_traitance SELECT policy
DROP POLICY IF EXISTS "Unified mission_sous_traitance SELECT policy" ON public.mission_sous_traitance;
CREATE POLICY "Unified mission_sous_traitance SELECT policy"
  ON public.mission_sous_traitance
  FOR SELECT
  USING (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel'
  );

-- Fix mission_sous_traitance UPDATE policy
DROP POLICY IF EXISTS "Unified mission_sous_traitance UPDATE policy" ON public.mission_sous_traitance;
CREATE POLICY "Unified mission_sous_traitance UPDATE policy"
  ON public.mission_sous_traitance
  FOR UPDATE
  USING (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel'
  )
  WITH CHECK (
    is_gestionnaire_or_admin() OR
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())) = 'personnel'
  );

-- Fix localite SELECT policy
DROP POLICY IF EXISTS "Unified localite SELECT policy" ON public.localite;
CREATE POLICY "Unified localite SELECT policy"
  ON public.localite
  FOR SELECT
  USING (
    (SELECT auth.role()) = 'authenticated'
  );

-- Fix type_conteneur SELECT policy
DROP POLICY IF EXISTS "Unified type_conteneur SELECT policy" ON public.type_conteneur;
CREATE POLICY "Unified type_conteneur SELECT policy"
  ON public.type_conteneur
  FOR SELECT
  USING (
    (SELECT auth.role()) = 'authenticated'
  );

-- Add comments
COMMENT ON POLICY "Unified trajet SELECT policy" ON public.trajet IS
  'Optimized: auth.uid() wrapped in SELECT for better performance at scale.';

COMMENT ON POLICY "Unified chauffeur SELECT policy" ON public.chauffeur IS
  'Optimized: auth.role() wrapped in SELECT for better performance at scale.';

COMMENT ON POLICY "Unified localite SELECT policy" ON public.localite IS
  'Optimized: auth.role() wrapped in SELECT for better performance at scale.';
