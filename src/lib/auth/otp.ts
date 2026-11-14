import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendOtpEmail } from '@/lib/email/brevo'

// In-memory fallback cache for OTPs in case the database table hasn't been executed in SQL editor yet
const memoryOtpStore = new Map<string, { code: string; hash: string; expiresAt: number; verified: boolean; attempts: number }>()

function sha256(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex')
}

export function generate6DigitOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Generate, persist, and dispatch a 6-digit OTP code to the requested email.
 */
export async function sendPasswordResetOtp(email: string): Promise<{ success: boolean; message: string; simulated?: boolean }> {
  const normalizedEmail = email.trim().toLowerCase()

  // 1. Verify that user exists in Supabase Auth
  const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
  const user = userList?.users?.find(u => u.email?.toLowerCase() === normalizedEmail)

  if (!user) {
    // Return friendly response (or security vague response if preferred)
    return { success: false, message: 'No registered account found with this email address.' }
  }

  // 2. Generate 6-digit OTP and SHA-256 hash
  const otpCode = generate6DigitOtp()
  const otpHash = sha256(otpCode)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  // 3. Persist in memory store for instant fallback reliability
  memoryOtpStore.set(normalizedEmail, {
    code: otpCode,
    hash: otpHash,
    expiresAt: expiresAt.getTime(),
    verified: false,
    attempts: 0,
  })

  // Also try persisting to Supabase table auth_otp_codes if it exists
  try {
    await supabaseAdmin.from('auth_otp_codes').insert({
      email: normalizedEmail,
      otp_hash: otpHash,
      expires_at: expiresAt.toISOString(),
      verified: false,
      attempts: 0,
    })
  } catch (err) {
    // If table doesn't exist yet, in-memory store seamlessly serves the request
  }

  // 4. Send email via Brevo
  const recipientName = (user.user_metadata?.full_name as string) || 'ReShift Moderator'
  const emailResult = await sendOtpEmail({
    toEmail: normalizedEmail,
    otpCode,
    recipientName,
  })

  return {
    success: true,
    message: emailResult.simulated
      ? `Simulated OTP [${otpCode}] logged to server console (configure BREVO_API_KEY in .env.local for live email delivery).`
      : 'A 6-digit verification code has been sent to your email address.',
    simulated: emailResult.simulated,
  }
}

/**
 * Verify a submitted 6-digit OTP code.
 */
export async function verifyPasswordResetOtp(email: string, otpCode: string): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase()
  const cleanCode = otpCode.trim()

  const cached = memoryOtpStore.get(normalizedEmail)

  if (!cached) {
    return { success: false, message: 'No active OTP found for this email. Please request a new code.' }
  }

  if (Date.now() > cached.expiresAt) {
    memoryOtpStore.delete(normalizedEmail)
    return { success: false, message: 'The verification code has expired. Please request a new one.' }
  }

  if (cached.attempts >= 5) {
    memoryOtpStore.delete(normalizedEmail)
    return { success: false, message: 'Too many incorrect attempts. Please request a new code.' }
  }

  if (cached.code !== cleanCode) {
    cached.attempts += 1
    return { success: false, message: `Incorrect code. ${5 - cached.attempts} attempt(s) remaining.` }
  }

  // Code is valid! Mark verified
  cached.verified = true

  return { success: true, message: 'Verification successful. You may now enter your new password.' }
}

/**
 * Apply the new password to the user once the OTP has been verified.
 */
export async function completePasswordReset(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase()

  const cached = memoryOtpStore.get(normalizedEmail)

  if (!cached || !cached.verified) {
    return { success: false, message: 'Unauthorized. You must verify the OTP code before resetting the password.' }
  }

  // Validate password strength: >= 8 chars, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  if (!passwordRegex.test(newPassword)) {
    return {
      success: false,
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.',
    }
  }

  // Look up user
  const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
  const user = userList?.users?.find(u => u.email?.toLowerCase() === normalizedEmail)

  if (!user) {
    return { success: false, message: 'User not found.' }
  }

  // Update password in Supabase Auth Admin
  const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  })

  if (updateErr) {
    return { success: false, message: updateErr.message }
  }

  // Invalidate OTP cache
  memoryOtpStore.delete(normalizedEmail)

  return { success: true, message: 'Password reset successful! You may now log in with your new credentials.' }
}
