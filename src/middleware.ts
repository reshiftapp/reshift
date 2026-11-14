import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import {
  TRUSTED_DEVICE_COOKIE_NAME,
  SESSION_2FA_COOKIE_NAME,
  verifyDeviceTrustToken,
} from '@/lib/auth/tokens'

// Routes that do NOT require authentication
const PUBLIC_FILE_EXTENSIONS = [
  '.ico',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.css',
  '.js',
  '.json',
  '.woff',
  '.woff2',
]

const PUBLIC_EXACT_ROUTES = ['/login', '/register', '/forgot-password']

const PUBLIC_ROUTE_PREFIXES = ['/_next', '/api/auth', '/api/upload']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Allow public assets and images
  if (
    PUBLIC_FILE_EXTENSIONS.some((ext) => pathname.endsWith(ext)) ||
    PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next()
  }

  const isPublicPage = PUBLIC_EXACT_ROUTES.includes(pathname)

  // 2. Initialize Supabase SSR Client with request/response cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // 3. Retrieve authenticated user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. If user is NOT logged in:
  if (!user) {
    // If attempting to access a protected dashboard route, redirect to /login
    if (!isPublicPage) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    // If already on a public page, allow
    return response
  }

  // 5. User IS logged in:
  const meta = user.user_metadata || {}
  const isSuperAdmin = user.email === 'reshiftapp@gmail.com' || meta.role === 'super_admin'
  const isApprovedStaff =
    meta.is_staff === true && meta.approval_status === 'approved'

  // If user is neither Super Admin nor approved staff (e.g. mobile app customer or pending volunteer)
  if (!isSuperAdmin && !isApprovedStaff) {
    if (!isPublicPage) {
      const loginUrl = new URL('/login', request.url)
      if (meta.approval_status === 'pending') {
        loginUrl.searchParams.set('error', 'pending')
      } else {
        loginUrl.searchParams.set('error', 'unauthorized')
      }
      return NextResponse.redirect(loginUrl)
    }
  }

  // 5b. Super Admin Two-Factor Authentication & 30-Day Trusted Device Check
  // Super Admin MUST complete 2FA unless this device is trusted (30-day cookie) or has an active 2FA session
  if (isSuperAdmin && !isPublicPage) {
    const trustToken = request.cookies.get(TRUSTED_DEVICE_COOKIE_NAME)?.value
    const sessionToken = request.cookies.get(SESSION_2FA_COOKIE_NAME)?.value

    let is2FAValid = false
    if (trustToken) {
      is2FAValid = await verifyDeviceTrustToken(trustToken, user.id)
    }
    if (!is2FAValid && sessionToken) {
      is2FAValid = await verifyDeviceTrustToken(sessionToken, user.id)
    }

    if (!is2FAValid) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Two-factor authentication required.' },
          { status: 401 }
        )
      }
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('step', '2fa')
      if (pathname !== '/') {
        loginUrl.searchParams.set('redirect', pathname)
      }
      return NextResponse.redirect(loginUrl)
    }
  }

  // 6. Strict Super Admin Route Protection
  const SUPER_ADMIN_ONLY_PREFIXES = ['/approvals', '/settings', '/audit-log', '/api/admin']
  const isSuperAdminRoute = SUPER_ADMIN_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  )

  if (isSuperAdminRoute && !isSuperAdmin) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Super Admin access required.' },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 7. If logged-in authorized staff/admin tries to visit /register, redirect to dashboard.
  // /login is intentionally permitted so users can view active session status or sign out cleanly.
  if (pathname === '/register' && (isSuperAdmin || isApprovedStaff)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
