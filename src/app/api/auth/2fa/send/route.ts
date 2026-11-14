import { NextResponse } from 'next/server'
import { SUPER_ADMIN_EMAIL, sendSuperAdmin2FA } from '@/lib/auth/2fa'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email } = await request.json().catch(() => ({}))

    if (!email || email.trim().toLowerCase() !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, message: 'Two-factor authentication is only applicable to the Super Administrator.' },
        { status: 400 }
      )
    }

    const res = await sendSuperAdmin2FA()
    return NextResponse.json(res)
  } catch (error: any) {
    console.error('Error in 2FA send route:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal error' }, { status: 500 })
  }
}
