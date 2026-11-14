import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  SUPER_ADMIN_EMAIL,
  TRUSTED_DEVICE_COOKIE_NAME,
  SESSION_2FA_COOKIE_NAME,
  TRUSTED_DEVICE_MAX_AGE,
  SESSION_2FA_MAX_AGE,
  createDeviceTrustToken,
  verifySuperAdmin2FA,
} from '@/lib/auth/2fa'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { otpCode, trustDevice, email } = await request.json()

    if (!email || email.trim().toLowerCase() !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, message: 'Invalid 2FA session.' },
        { status: 400 }
      )
    }

    if (!otpCode || typeof otpCode !== 'string') {
      return NextResponse.json(
        { success: false, message: '6-digit OTP code is required.' },
        { status: 400 }
      )
    }

    // Verify 6-digit OTP
    const verification = verifySuperAdmin2FA(otpCode)
    if (!verification.success) {
      return NextResponse.json(verification, { status: 400 })
    }

    // Retrieve Super Admin user record
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
    const superAdminUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === SUPER_ADMIN_EMAIL
    )

    if (!superAdminUser) {
      return NextResponse.json({ success: false, message: 'Super Admin account not found.' }, { status: 404 })
    }

    const cookieStore = await cookies()

    // 1. Set 24-hour active session 2FA verification cookie
    const sessionToken = await createDeviceTrustToken(superAdminUser.id, SESSION_2FA_MAX_AGE)
    cookieStore.set({
      name: SESSION_2FA_COOKIE_NAME,
      value: sessionToken.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: sessionToken.maxAge, // 24 hours
    })

    // 2. If 'Trust this device for 30 days' was selected:
    if (trustDevice === true) {
      const trustedToken = await createDeviceTrustToken(superAdminUser.id, TRUSTED_DEVICE_MAX_AGE)
      cookieStore.set({
        name: TRUSTED_DEVICE_COOKIE_NAME,
        value: trustedToken.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: trustedToken.maxAge, // 30 days (2,592,000 seconds)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication verified successfully.',
      trustedDeviceSaved: Boolean(trustDevice),
    })
  } catch (error: any) {
    console.error('2FA verification route error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal error' }, { status: 500 })
  }
}
