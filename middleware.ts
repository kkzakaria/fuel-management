import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login"];

  // If user is not authenticated and trying to access protected route
  if (!user && !publicRoutes.includes(pathname)) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated
  if (user) {
    // Get user profile to check if active
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    // If account is not active, sign out and redirect to login
    if (!profile || !profile.is_active) {
      await supabase.auth.signOut();
      const redirectUrl = new URL("/login", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If authenticated user tries to access login, redirect to dashboard
    if (pathname === "/login") {
      const redirectUrl = new URL("/", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Check role-based access for /register (admin only)
    if (pathname === "/register" && profile.role !== "admin") {
      const redirectUrl = new URL("/", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|icons/.*|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
