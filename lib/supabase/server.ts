import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase client for server-side operations
 *
 * This client is used in Server Components, Server Actions, and Route Handlers.
 * It properly handles cookie-based authentication for server environments.
 *
 * @example Server Component
 * ```tsx
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function Page() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('chauffeur').select('*')
 *   return <div>{data?.length} drivers</div>
 * }
 * ```
 *
 * @example Server Action
 * ```tsx
 * 'use server'
 *
 * import { createClient } from '@/lib/supabase/server'
 *
 * export async function createDriver(formData: FormData) {
 *   const supabase = await createClient()
 *   const { error } = await supabase
 *     .from('chauffeur')
 *     .insert({ nom: formData.get('nom') })
 * }
 * ```
 */
export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Cookie setting can fail in Server Components
            // This is expected behavior in some contexts
          }
        },
      },
    }
  )
}
