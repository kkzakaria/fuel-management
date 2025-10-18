# API Routes

Server-side API endpoints for the application.

## Planned Endpoints (Phase 6)

- **`/api/export-pdf`** - Generate PDF reports
- **`/api/generate-report`** - Generate various report types

## Usage

API routes use Next.js App Router Route Handlers:

```typescript
export async function GET(request: Request) {
  // Handle GET requests
}

export async function POST(request: Request) {
  // Handle POST requests
}
```

## Integration

- Use `lib/supabase/server.ts` for database access
- Implement authentication checks
- Return appropriate status codes and error handling
