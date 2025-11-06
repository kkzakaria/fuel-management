-- Migration: Fix RLS Auth UID Performance
-- Description: Optimize RLS policies by wrapping auth.uid() in SELECT to prevent re-evaluation per row
-- Issue: Auth RLS InitPlan (2 policies on profiles table)
-- Priority: WARN - Performance degradation at scale
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- 1. Drop and recreate "Users can view own profile" policy with optimized auth.uid()
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (id = (SELECT auth.uid()));

-- 2. Drop and recreate "Users can update own profile" policy with optimized auth.uid()
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Add comments to track this performance optimization
COMMENT ON POLICY "Users can view own profile" ON public.profiles IS
  'Allows users to view their own profile. Optimized with (SELECT auth.uid()) for better performance at scale.';

COMMENT ON POLICY "Users can update own profile" ON public.profiles IS
  'Allows users to update their own profile. Optimized with (SELECT auth.uid()) for better performance at scale.';
