import { NextResponse } from 'next/server'
import { sendPasswordResetOtp } from '@/lib/auth/otp'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, message: 'Valid email address is required.' }, { status: 400 })
    }

    const result = await sendPasswordResetOtp(email)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in send-otp route:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}
