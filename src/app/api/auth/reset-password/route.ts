import { NextResponse } from 'next/server'
import { completePasswordReset } from '@/lib/auth/otp'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json({ success: false, message: 'Email and new password are required.' }, { status: 400 })
    }

    const result = await completePasswordReset(email, newPassword)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in reset-password route:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}
