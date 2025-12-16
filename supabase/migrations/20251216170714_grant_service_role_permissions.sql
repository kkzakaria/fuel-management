-- Migration: Grant service_role permissions for seeding
-- Description: Allows service_role to update profiles and chauffeur tables
-- Required for scripts/seed-users.ts to work correctly

-- Grant service_role full access to profiles (needed for updating user roles)
GRANT ALL ON public.profiles TO service_role;

-- Grant service_role full access to chauffeur (needed for status distribution seeding)
GRANT ALL ON public.chauffeur TO service_role;

-- Grant service_role access to the view
GRANT SELECT ON public.chauffeur_status_stats TO service_role;

COMMENT ON TABLE public.profiles IS 'User profiles with role-based access. service_role has full access for seeding.';
