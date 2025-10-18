# Authentication Routes

This directory contains all authentication-related pages.

## Routes

- **`/login`** - User login page
- **`/register`** - User registration (admin only)

## Implementation (Phase 1)

These routes will be implemented in Phase 1 with:
- Email/password authentication via Supabase Auth
- Role-based access control (admin, gestionnaire, chauffeur, personnel)
- Session management with cookies
- Middleware protection for authenticated routes

## Related Files

- `lib/supabase/client.ts` - Browser-side auth client
- `lib/supabase/server.ts` - Server-side auth client
- Middleware will be added at project root for route protection
