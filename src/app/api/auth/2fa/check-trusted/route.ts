import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  SUPER_ADMIN_EMAIL,
  TRUSTED_DEVICE_COOKIE_NAME,
  SESSION_2FA_COOKIE_NAME,
  verifyDeviceTrustToken,
} from '@/lib/auth/tokens'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email } = await request.json().catch(() => ({}))

    if (!email || email.trim().toLowerCase() !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ trusted: false })
    }

    const cookieStore = await cookies()
    const trustCookie = cookieStore.get(TRUSTED_DEVICE_COOKIE_NAME)?.value
    const sessionCookie = cookieStore.get(SESSION_2FA_COOKIE_NAME)?.value

    if (!trustCookie && !sessionCookie) {
      return NextResponse.json({ trusted: false })
    }

    // Lookup super admin user ID
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
    const superAdminUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === SUPER_ADMIN_EMAIL
    )

    if (!superAdminUser) {
      return NextResponse.json({ trusted: false })
    }

    // First check 30-day trusted device token
    if (trustCookie) {
      const isTrusted = await verifyDeviceTrustToken(trustCookie, superAdminUser.id)
      if (isTrusted) {
        return NextResponse.json({ trusted: true, isPermanentDevice: true })
      }
    }

    // Next check 24-hour session 2FA token
    if (sessionCookie) {
      const isSessionValid = await verifyDeviceTrustToken(sessionCookie, superAdminUser.id)
      if (isSessionValid) {
        return NextResponse.json({ trusted: true, isPermanentDevice: false })
      }
    }

    return NextResponse.json({ trusted: false })
  } catch (error: any) {
    console.error('Check trusted device error:', error)
    return NextResponse.json({ trusted: false })
  }
}
