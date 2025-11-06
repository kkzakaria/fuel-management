-- Migration: Fix Function Search Path Security
-- Description: Set explicit search_path on all functions to prevent SQL injection attacks
-- Issue: Function Search Path Mutable (8 functions affected)
-- Priority: CRITICAL - Security vulnerability
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- 1. Fix update_updated_at_column function
ALTER FUNCTION public.update_updated_at_column()
  SET search_path = public, pg_temp;

-- 2. Fix handle_new_user function
ALTER FUNCTION public.handle_new_user()
  SET search_path = public, pg_temp;

-- 3. Fix update_last_login function
ALTER FUNCTION public.update_last_login()
  SET search_path = public, pg_temp;

-- 4. Fix is_admin function
ALTER FUNCTION public.is_admin()
  SET search_path = public, pg_temp;

-- 5. Fix is_gestionnaire_or_admin function
ALTER FUNCTION public.is_gestionnaire_or_admin()
  SET search_path = public, pg_temp;

-- 6. Fix is_chauffeur function
ALTER FUNCTION public.is_chauffeur()
  SET search_path = public, pg_temp;

-- 7. Fix get_current_chauffeur_id function
ALTER FUNCTION public.get_current_chauffeur_id()
  SET search_path = public, pg_temp;

-- 8. Fix create_test_profiles function
ALTER FUNCTION public.create_test_profiles()
  SET search_path = public, pg_temp;

-- Add comment to track this security fix
COMMENT ON FUNCTION public.update_updated_at_column() IS
  'Trigger function to update updated_at timestamp. Search path secured against SQL injection.';

COMMENT ON FUNCTION public.handle_new_user() IS
  'Trigger function to create profile on user signup. Search path secured against SQL injection.';

COMMENT ON FUNCTION public.update_last_login() IS
  'Function to update last login timestamp. Search path secured against SQL injection.';

COMMENT ON FUNCTION public.is_admin() IS
  'Check if current user has admin role. Search path secured against SQL injection.';

COMMENT ON FUNCTION public.is_gestionnaire_or_admin() IS
  'Check if current user has gestionnaire or admin role. Search path secured against SQL injection.';

COMMENT ON FUNCTION public.is_chauffeur() IS
  'Check if current user has chauffeur role. Search path secured against SQL injection.';

COMMENT ON FUNCTION public.get_current_chauffeur_id() IS
  'Get chauffeur_id for current authenticated user. Search path secured against SQL injection.';

COMMENT ON FUNCTION public.create_test_profiles() IS
  'Create test user profiles for development. Search path secured against SQL injection.';
