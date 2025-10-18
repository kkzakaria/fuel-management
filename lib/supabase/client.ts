import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for browser-side operations
 *
 * This client is used in Client Components and browser contexts.
 * It automatically handles authentication state and cookie management.
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { supabase } from '@/lib/supabase/client'
 *
 * export function MyComponent() {
 *   const fetchData = async () => {
 *     const { data, error } = await supabase
 *       .from('chauffeur')
 *       .select('*')
 *   }
 * }
 * ```
 */
export const createClient = () => {
  return createBrowserClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
  )
}
