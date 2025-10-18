-- Migration: create_profiles_and_auth
-- Description: Creates profiles table with user roles and authentication setup
-- Author: Claude Code
-- Date: 2025-10-18

-- =====================================================
-- USER ROLE TYPE - Enum for the 4 application roles
-- =====================================================
CREATE TYPE user_role AS ENUM ('admin', 'gestionnaire', 'chauffeur', 'personnel');

-- =====================================================
-- PROFILES TABLE - Extends Supabase auth.users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'personnel',

  -- Personal information
  nom VARCHAR(100),
  prenom VARCHAR(100),
  telephone VARCHAR(20),

  -- Link to CHAUFFEUR table for driver users
  chauffeur_id UUID REFERENCES public.CHAUFFEUR(id) ON DELETE SET NULL,

  -- Account status
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_chauffeur ON public.profiles(chauffeur_id);
CREATE INDEX idx_profiles_active ON public.profiles(is_active);

-- =====================================================
-- FUNCTION - Auto-create profile on user signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'personnel');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER - Create profile when user signs up
-- =====================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FUNCTION - Update last_login timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET last_login = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION - Update updated_at timestamp
-- =====================================================
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS - Role checking utilities
-- =====================================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is gestionnaire or admin
CREATE OR REPLACE FUNCTION public.is_gestionnaire_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'gestionnaire')
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is chauffeur
CREATE OR REPLACE FUNCTION public.is_chauffeur()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'chauffeur' AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user's chauffeur_id (if they are a driver)
CREATE OR REPLACE FUNCTION public.get_current_chauffeur_id()
RETURNS UUID AS $$
DECLARE
  chauffeur_uuid UUID;
BEGIN
  SELECT chauffeur_id INTO chauffeur_uuid
  FROM public.profiles
  WHERE id = auth.uid() AND role = 'chauffeur' AND is_active = TRUE;

  RETURN chauffeur_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS - Documentation
-- =====================================================
COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth with roles and metadata';
COMMENT ON TYPE user_role IS 'Application roles: admin (full access), gestionnaire (manager), chauffeur (driver), personnel (staff)';
COMMENT ON COLUMN public.profiles.chauffeur_id IS 'Links profile to CHAUFFEUR table for driver users';
COMMENT ON COLUMN public.profiles.is_active IS 'Account active status (manually controlled by admin)';
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if current user is an active admin';
COMMENT ON FUNCTION public.is_gestionnaire_or_admin() IS 'Returns true if current user is an active gestionnaire or admin';
COMMENT ON FUNCTION public.is_chauffeur() IS 'Returns true if current user is an active chauffeur';
COMMENT ON FUNCTION public.get_current_chauffeur_id() IS 'Returns the chauffeur_id for the current user if they are a driver';
