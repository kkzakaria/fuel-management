-- Migration: create_rls_policies
-- Description: Row Level Security policies for all tables based on 4 user roles
-- Author: Claude Code
-- Date: 2025-10-18

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.LOCALITE ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.TYPE_CONTENEUR ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.CHAUFFEUR ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.VEHICULE ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.SOUS_TRAITANT ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.TRAJET ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.CONTENEUR_TRAJET ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.MISSION_SOUS_TRAITANCE ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Gestionnaires can view all profiles
CREATE POLICY "Gestionnaires can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_gestionnaire_or_admin());

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- LOCALITE TABLE POLICIES (Reference data)
-- =====================================================

-- All authenticated users can view locations
CREATE POLICY "Authenticated users can view LOCALITE"
  ON public.LOCALITE FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert/update/delete locations
CREATE POLICY "Admins can manage LOCALITE"
  ON public.LOCALITE FOR ALL
  USING (public.is_admin());

-- =====================================================
-- TYPE_CONTENEUR TABLE POLICIES (Reference data)
-- =====================================================

-- All authenticated users can view container types
CREATE POLICY "Authenticated users can view TYPE_CONTENEUR"
  ON public.TYPE_CONTENEUR FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage container types
CREATE POLICY "Admins can manage TYPE_CONTENEUR"
  ON public.TYPE_CONTENEUR FOR ALL
  USING (public.is_admin());

-- =====================================================
-- CHAUFFEUR TABLE POLICIES
-- =====================================================

-- Admins and gestionnaires can view all drivers
CREATE POLICY "Admins and gestionnaires can view CHAUFFEUR"
  ON public.CHAUFFEUR FOR SELECT
  USING (public.is_gestionnaire_or_admin());

-- Chauffeurs can view their own record
CREATE POLICY "Chauffeurs can view own record"
  ON public.CHAUFFEUR FOR SELECT
  USING (
    id = public.get_current_chauffeur_id()
  );

-- Only admins and gestionnaires can manage drivers
CREATE POLICY "Admins and gestionnaires can manage CHAUFFEUR"
  ON public.CHAUFFEUR FOR ALL
  USING (public.is_gestionnaire_or_admin());

-- =====================================================
-- VEHICULE TABLE POLICIES
-- =====================================================

-- Admins and gestionnaires can view all vehicles
CREATE POLICY "Admins and gestionnaires can view VEHICULE"
  ON public.VEHICULE FOR SELECT
  USING (public.is_gestionnaire_or_admin());

-- Chauffeurs can view vehicles (for trip recording)
CREATE POLICY "Chauffeurs can view VEHICULE"
  ON public.VEHICULE FOR SELECT
  USING (public.is_chauffeur());

-- Only admins and gestionnaires can manage vehicles
CREATE POLICY "Admins and gestionnaires can manage VEHICULE"
  ON public.VEHICULE FOR ALL
  USING (public.is_gestionnaire_or_admin());

-- =====================================================
-- SOUS_TRAITANT TABLE POLICIES
-- =====================================================

-- Admins and gestionnaires can view subcontractors
CREATE POLICY "Admins and gestionnaires can view SOUS_TRAITANT"
  ON public.SOUS_TRAITANT FOR SELECT
  USING (public.is_gestionnaire_or_admin());

-- Personnel can view subcontractors (for data entry)
CREATE POLICY "Personnel can view SOUS_TRAITANT"
  ON public.SOUS_TRAITANT FOR SELECT
  TO authenticated
  USING (true);

-- Only admins and gestionnaires can manage subcontractors
CREATE POLICY "Admins and gestionnaires can manage SOUS_TRAITANT"
  ON public.SOUS_TRAITANT FOR ALL
  USING (public.is_gestionnaire_or_admin());

-- =====================================================
-- TRAJET TABLE POLICIES
-- =====================================================

-- Admins and gestionnaires can view all trips
CREATE POLICY "Admins and gestionnaires can view all TRAJET"
  ON public.TRAJET FOR SELECT
  USING (public.is_gestionnaire_or_admin());

-- Chauffeurs can view their own trips
CREATE POLICY "Chauffeurs can view own TRAJET"
  ON public.TRAJET FOR SELECT
  USING (
    chauffeur_id = public.get_current_chauffeur_id()
  );

-- Personnel can view all trips (for data entry)
CREATE POLICY "Personnel can view TRAJET"
  ON public.TRAJET FOR SELECT
  TO authenticated
  USING (true);

-- Chauffeurs can insert their own trips
CREATE POLICY "Chauffeurs can insert own TRAJET"
  ON public.TRAJET FOR INSERT
  WITH CHECK (
    chauffeur_id = public.get_current_chauffeur_id()
  );

-- Chauffeurs can update their own trips (if not terminated)
CREATE POLICY "Chauffeurs can update own TRAJET"
  ON public.TRAJET FOR UPDATE
  USING (
    chauffeur_id = public.get_current_chauffeur_id()
    AND statut != 'termine'
  );

-- Admins and gestionnaires can manage all trips
CREATE POLICY "Admins and gestionnaires can manage all TRAJET"
  ON public.TRAJET FOR ALL
  USING (public.is_gestionnaire_or_admin());

-- Personnel can manage trips (for data entry)
CREATE POLICY "Personnel can manage TRAJET"
  ON public.TRAJET FOR ALL
  TO authenticated
  USING (true);

-- =====================================================
-- CONTENEUR_TRAJET TABLE POLICIES
-- =====================================================

-- Same read access as TRAJET
CREATE POLICY "Admins and gestionnaires can view CONTENEUR_TRAJET"
  ON public.CONTENEUR_TRAJET FOR SELECT
  USING (
    public.is_gestionnaire_or_admin()
    OR EXISTS (
      SELECT 1 FROM public.TRAJET
      WHERE TRAJET.id = CONTENEUR_TRAJET.trajet_id
      AND TRAJET.chauffeur_id = public.get_current_chauffeur_id()
    )
  );

-- Personnel can view all container-trip links
CREATE POLICY "Personnel can view CONTENEUR_TRAJET"
  ON public.CONTENEUR_TRAJET FOR SELECT
  TO authenticated
  USING (true);

-- Chauffeurs can insert containers for their own trips
CREATE POLICY "Chauffeurs can insert own CONTENEUR_TRAJET"
  ON public.CONTENEUR_TRAJET FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.TRAJET
      WHERE TRAJET.id = CONTENEUR_TRAJET.trajet_id
      AND TRAJET.chauffeur_id = public.get_current_chauffeur_id()
    )
  );

-- Admins and gestionnaires can manage all container-trip links
CREATE POLICY "Admins and gestionnaires can manage CONTENEUR_TRAJET"
  ON public.CONTENEUR_TRAJET FOR ALL
  USING (public.is_gestionnaire_or_admin());

-- Personnel can manage container-trip links
CREATE POLICY "Personnel can manage CONTENEUR_TRAJET"
  ON public.CONTENEUR_TRAJET FOR ALL
  TO authenticated
  USING (true);

-- =====================================================
-- MISSION_SOUS_TRAITANCE TABLE POLICIES
-- =====================================================

-- Admins and gestionnaires can view all missions
CREATE POLICY "Admins and gestionnaires can view MISSION_SOUS_TRAITANCE"
  ON public.MISSION_SOUS_TRAITANCE FOR SELECT
  USING (public.is_gestionnaire_or_admin());

-- Personnel can view missions (for payment tracking)
CREATE POLICY "Personnel can view MISSION_SOUS_TRAITANCE"
  ON public.MISSION_SOUS_TRAITANCE FOR SELECT
  TO authenticated
  USING (true);

-- Only admins and gestionnaires can create missions
CREATE POLICY "Admins and gestionnaires can insert MISSION_SOUS_TRAITANCE"
  ON public.MISSION_SOUS_TRAITANCE FOR INSERT
  WITH CHECK (public.is_gestionnaire_or_admin());

-- Only admins and gestionnaires can update missions
CREATE POLICY "Admins and gestionnaires can update MISSION_SOUS_TRAITANCE"
  ON public.MISSION_SOUS_TRAITANCE FOR UPDATE
  USING (public.is_gestionnaire_or_admin());

-- Personnel can update payment status
CREATE POLICY "Personnel can update payment status"
  ON public.MISSION_SOUS_TRAITANCE FOR UPDATE
  TO authenticated
  USING (true);

-- Only admins can delete missions
CREATE POLICY "Only admins can delete MISSION_SOUS_TRAITANCE"
  ON public.MISSION_SOUS_TRAITANCE FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- COMMENTS - Policy documentation
-- =====================================================
COMMENT ON POLICY "Admins can view all profiles" ON public.profiles IS 'Administrators have full visibility of all user profiles';
COMMENT ON POLICY "Chauffeurs can view own TRAJET" ON public.TRAJET IS 'Drivers can only see their own trip records';
COMMENT ON POLICY "Chauffeurs can update own TRAJET" ON public.TRAJET IS 'Drivers can edit their own trips if not yet terminated';
COMMENT ON POLICY "Personnel can update payment status" ON public.MISSION_SOUS_TRAITANCE IS 'Administrative staff can track subcontractor payments';
