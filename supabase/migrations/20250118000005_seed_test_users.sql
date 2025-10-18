-- Migration: seed_test_users
-- Description: Creates test user profiles for each role (requires manual user creation via Supabase Dashboard)
-- Author: Claude Code
-- Date: 2025-10-18
-- NOTE: This migration only creates profile entries. Actual auth.users must be created manually in Supabase Dashboard first.

-- =====================================================
-- INSTRUCTIONS FOR TEST USERS CREATION
-- =====================================================
--
-- To use these test users, you must first create them in Supabase Dashboard:
--
-- 1. Go to: https://czuwfjzyhfljpscqtfrp.supabase.co/project/czuwfjzyhfljpscqtfrp/auth/users
-- 2. Click "Add user" → "Create new user"
-- 3. Create users with these emails and note their UUIDs:
--
--    Email: admin@transport.ci
--    Password: Admin123!
--    Role: admin (will be set in profiles table)
--
--    Email: gestionnaire@transport.ci
--    Password: Gestion123!
--    Role: gestionnaire
--
--    Email: chauffeur1@transport.ci
--    Password: Chauffeur123!
--    Role: chauffeur (will be linked to CHAUFFEUR table)
--
--    Email: chauffeur2@transport.ci
--    Password: Chauffeur123!
--    Role: chauffeur
--
--    Email: personnel@transport.ci
--    Password: Personnel123!
--    Role: personnel
--
-- 4. After creating users, update the UUIDs in the INSERT statements below
-- 5. Run this migration
--
-- =====================================================

-- =====================================================
-- PLACEHOLDER UUIDS - REPLACE THESE AFTER USER CREATION
-- =====================================================
-- These are example UUIDs. Replace with actual UUIDs from auth.users after manual creation
--
-- ADMIN_UUID:        Replace with actual UUID from Supabase Dashboard
-- GESTIONNAIRE_UUID: Replace with actual UUID from Supabase Dashboard
-- CHAUFFEUR1_UUID:   Replace with actual UUID from Supabase Dashboard
-- CHAUFFEUR2_UUID:   Replace with actual UUID from Supabase Dashboard
-- PERSONNEL_UUID:    Replace with actual UUID from Supabase Dashboard
--
-- Example format: '123e4567-e89b-12d3-a456-426614174000'

-- =====================================================
-- FUNCTION - Create test profiles (to be run after auth user creation)
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_test_profiles()
RETURNS void AS $$
DECLARE
  admin_uuid UUID;
  gestionnaire_uuid UUID;
  chauffeur1_uuid UUID;
  chauffeur2_uuid UUID;
  personnel_uuid UUID;
  test_chauffeur1_id UUID;
  test_chauffeur2_id UUID;
BEGIN
  -- Get UUIDs from auth.users (these users must exist first)
  SELECT id INTO admin_uuid FROM auth.users WHERE email = 'admin@transport.ci';
  SELECT id INTO gestionnaire_uuid FROM auth.users WHERE email = 'gestionnaire@transport.ci';
  SELECT id INTO chauffeur1_uuid FROM auth.users WHERE email = 'chauffeur1@transport.ci';
  SELECT id INTO chauffeur2_uuid FROM auth.users WHERE email = 'chauffeur2@transport.ci';
  SELECT id INTO personnel_uuid FROM auth.users WHERE email = 'personnel@transport.ci';

  -- Get test chauffeur IDs
  SELECT id INTO test_chauffeur1_id FROM public.CHAUFFEUR WHERE nom = 'Kouassi' AND prenom = 'Jean-Baptiste';
  SELECT id INTO test_chauffeur2_id FROM public.CHAUFFEUR WHERE nom = 'Coulibaly' AND prenom = 'Mamadou';

  -- Only proceed if admin user exists (all others are optional)
  IF admin_uuid IS NOT NULL THEN
    -- Insert or update admin profile
    INSERT INTO public.profiles (id, email, role, nom, prenom, telephone, is_active)
    VALUES (admin_uuid, 'admin@transport.ci', 'admin', 'Admin', 'Système', '+225 27 20 00 00 01', true)
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      nom = 'Admin',
      prenom = 'Système',
      is_active = true;

    RAISE NOTICE 'Admin profile created/updated';
  END IF;

  IF gestionnaire_uuid IS NOT NULL THEN
    -- Insert or update gestionnaire profile
    INSERT INTO public.profiles (id, email, role, nom, prenom, telephone, is_active)
    VALUES (gestionnaire_uuid, 'gestionnaire@transport.ci', 'gestionnaire', 'Diaby', 'Aminata', '+225 27 20 00 00 02', true)
    ON CONFLICT (id) DO UPDATE SET
      role = 'gestionnaire',
      nom = 'Diaby',
      prenom = 'Aminata',
      is_active = true;

    RAISE NOTICE 'Gestionnaire profile created/updated';
  END IF;

  IF chauffeur1_uuid IS NOT NULL AND test_chauffeur1_id IS NOT NULL THEN
    -- Insert or update chauffeur1 profile (linked to CHAUFFEUR table)
    INSERT INTO public.profiles (id, email, role, nom, prenom, telephone, chauffeur_id, is_active)
    VALUES (chauffeur1_uuid, 'chauffeur1@transport.ci', 'chauffeur', 'Kouassi', 'Jean-Baptiste', '+225 07 12 34 56 78', test_chauffeur1_id, true)
    ON CONFLICT (id) DO UPDATE SET
      role = 'chauffeur',
      chauffeur_id = test_chauffeur1_id,
      is_active = true;

    RAISE NOTICE 'Chauffeur1 profile created/updated and linked to CHAUFFEUR table';
  END IF;

  IF chauffeur2_uuid IS NOT NULL AND test_chauffeur2_id IS NOT NULL THEN
    -- Insert or update chauffeur2 profile (linked to CHAUFFEUR table)
    INSERT INTO public.profiles (id, email, role, nom, prenom, telephone, chauffeur_id, is_active)
    VALUES (chauffeur2_uuid, 'chauffeur2@transport.ci', 'chauffeur', 'Coulibaly', 'Mamadou', '+225 05 23 45 67 89', test_chauffeur2_id, true)
    ON CONFLICT (id) DO UPDATE SET
      role = 'chauffeur',
      chauffeur_id = test_chauffeur2_id,
      is_active = true;

    RAISE NOTICE 'Chauffeur2 profile created/updated and linked to CHAUFFEUR table';
  END IF;

  IF personnel_uuid IS NOT NULL THEN
    -- Insert or update personnel profile
    INSERT INTO public.profiles (id, email, role, nom, prenom, telephone, is_active)
    VALUES (personnel_uuid, 'personnel@transport.ci', 'personnel', 'N''Guessan', 'Christelle', '+225 27 20 00 00 03', true)
    ON CONFLICT (id) DO UPDATE SET
      role = 'personnel',
      nom = 'N''Guessan',
      prenom = 'Christelle',
      is_active = true;

    RAISE NOTICE 'Personnel profile created/updated';
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS - Test user documentation
-- =====================================================
COMMENT ON FUNCTION public.create_test_profiles() IS 'Creates or updates test user profiles after manual auth.users creation in Supabase Dashboard. Run this function after creating test users manually.';

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================
--
-- After creating test users manually in Supabase Dashboard:
-- 1. Run: SELECT public.create_test_profiles();
-- 2. Verify: SELECT * FROM public.profiles;
-- 3. Test login with each user email and password
--
-- Test users:
-- - admin@transport.ci (Admin role - full access)
-- - gestionnaire@transport.ci (Manager role - monitoring and reports)
-- - chauffeur1@transport.ci (Driver role - own trips only, linked to Kouassi Jean-Baptiste)
-- - chauffeur2@transport.ci (Driver role - own trips only, linked to Coulibaly Mamadou)
-- - personnel@transport.ci (Staff role - data entry)
--
