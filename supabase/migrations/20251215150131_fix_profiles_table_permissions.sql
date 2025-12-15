-- Fix profiles table permissions
-- RLS policies require underlying GRANT permissions to function
-- Without these grants, queries fail with "permission denied" before RLS is evaluated

-- Grant SELECT, INSERT, UPDATE to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Grant SELECT to anonymous users (for potential public profile views)
GRANT SELECT ON public.profiles TO anon;

-- Ensure schema usage is granted
GRANT USAGE ON SCHEMA public TO authenticated, anon;
