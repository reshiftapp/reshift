import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, mobileNumber, password, confirmPassword, idCardUrl, city, requestedRole } = body

    // 1. Name validation: alphabetic characters and spaces only
    const nameRegex = /^[a-zA-Z\s]{2,50}$/
    if (!fullName || !nameRegex.test(fullName.trim())) {
      return NextResponse.json(
        { success: false, message: 'Name must only contain alphabetic letters and spaces (2-50 characters).' },
        { status: 400 }
      )
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json({ success: false, message: 'Please provide a valid email address.' }, { status: 400 })
    }

    // 3. Indian Mobile Number: 10 digits without +91, starts with 6, 7, 8, or 9
    const mobileRegex = /^[6-9]\d{9}$/
    if (!mobileNumber || !mobileRegex.test(mobileNumber.trim())) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Please provide a valid 10-digit Indian mobile number without country code (+91), starting with 6, 7, 8, or 9.',
        },
        { status: 400 }
      )
    }

    // 4. Password validation: at least 8 chars, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!password || !passwordRegex.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.',
        },
        { status: 400 }
      )
    }

    // 5. Confirm password match
    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: 'Passwords do not match.' }, { status: 400 })
    }

    // 6. ID Card image is mandatory
    if (!idCardUrl || typeof idCardUrl !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Official Company or Volunteer ID card photo is required.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // 7. Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const alreadyExists = existingUsers?.users?.some(u => u.email?.toLowerCase() === normalizedEmail)

    if (alreadyExists) {
      return NextResponse.json(
        { success: false, message: 'An account with this email address already exists. Please log in or reset your password.' },
        { status: 409 }
      )
    }

    // 8. Create user in Supabase Auth Admin with pending approval state
    const { data: newUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true, // confirmed in auth, but application status is pending
      user_metadata: {
        is_staff: true,
        full_name: fullName.trim(),
        mobile_number: mobileNumber.trim(),
        idCardUrl: idCardUrl.trim(),
        id_card_url: idCardUrl.trim(),
        approval_status: 'pending',
        requested_role: requestedRole || 'volunteer',
        city: city || 'Kochi',
      },
    })

    if (createAuthError || !newUser?.user) {
      console.error('Failed to create auth user:', createAuthError)
      return NextResponse.json({ success: false, message: createAuthError?.message || 'Failed to register account.' }, { status: 500 })
    }

    // Staff accounts remain quarantined in Supabase Auth user_metadata (is_staff: true, approval_status: 'pending')
    // and do NOT pollute the Flutter mobile app customer profiles table.

    return NextResponse.json({
      success: true,
      message:
        'Registration submitted successfully! Your application is in pending review. The Super Admin will verify your company ID card before approving login access.',
    })
  } catch (error: any) {
    console.error('Registration route error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}
