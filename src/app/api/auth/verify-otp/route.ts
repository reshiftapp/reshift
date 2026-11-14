import { NextResponse } from 'next/server'
import { verifyPasswordResetOtp } from '@/lib/auth/otp'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email, otpCode } = await request.json()

    if (!email || !otpCode) {
      return NextResponse.json({ success: false, message: 'Email and verification code are required.' }, { status: 400 })
    }

    const result = await verifyPasswordResetOtp(email, otpCode)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in verify-otp route:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}
