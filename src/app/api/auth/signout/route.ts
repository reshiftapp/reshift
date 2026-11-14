import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options })
          })
        },
      },
    })

    // 1. Sign out on Supabase Auth server
    await supabase.auth.signOut()

    // 2. Clear transient 2FA session cookie (leave 30-day trusted device token intact if configured)
    try {
      cookieStore.delete('reshift_2fa_session')
    } catch {
      cookieStore.set({ name: 'reshift_2fa_session', value: '', path: '/', maxAge: 0 })
    }

    // 3. Explicitly destroy all session cookies
    const allCookies = cookieStore.getAll()
    allCookies.forEach((cookie) => {
      if (
        cookie.name.startsWith('sb-') ||
        cookie.name.includes('auth') ||
        cookie.name.includes('supabase')
      ) {
        try {
          cookieStore.delete(cookie.name)
        } catch {
          cookieStore.set({
            name: cookie.name,
            value: '',
            path: '/',
            maxAge: 0,
          })
        }
      }
    })

    const accept = request.headers.get('accept') || ''
    if (accept.includes('application/json')) {
      return NextResponse.json({ success: true, message: 'Signed out successfully' })
    }

    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl, { status: 303 })
  } catch (error: any) {
    console.error('Sign out error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  // Allow simple GET /api/auth/signout for link-based logout
  return POST(request)
}
