import crypto from 'crypto'
import { sendSuperAdmin2FAEmail } from '@/lib/email/brevo'
import { generate6DigitOtp } from '@/lib/auth/otp'
import {
  SUPER_ADMIN_EMAIL,
  TRUSTED_DEVICE_COOKIE_NAME,
  SESSION_2FA_COOKIE_NAME,
  TRUSTED_DEVICE_MAX_AGE,
  SESSION_2FA_MAX_AGE,
  createDeviceTrustToken,
  verifyDeviceTrustToken,
} from './tokens'

export {
  SUPER_ADMIN_EMAIL,
  TRUSTED_DEVICE_COOKIE_NAME,
  SESSION_2FA_COOKIE_NAME,
  TRUSTED_DEVICE_MAX_AGE,
  SESSION_2FA_MAX_AGE,
  createDeviceTrustToken,
  verifyDeviceTrustToken,
}

// In-memory store for active 2FA OTP codes
const superAdminOtpStore = new Map<string, { code: string; hash: string; expiresAt: number; attempts: number }>()

function sha256(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex')
}

/**
 * Sends a 6-digit 2FA OTP email to the Super Admin via Brevo.
 */
export async function sendSuperAdmin2FA(): Promise<{ success: boolean; message: string; simulated?: boolean }> {
  const otpCode = generate6DigitOtp()
  const otpHash = sha256(otpCode)
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

  superAdminOtpStore.set(SUPER_ADMIN_EMAIL, {
    code: otpCode,
    hash: otpHash,
    expiresAt,
    attempts: 0,
  })

  const emailRes = await sendSuperAdmin2FAEmail({
    toEmail: SUPER_ADMIN_EMAIL,
    otpCode,
  })

  return {
    success: true,
    message: emailRes.simulated
      ? `Simulated 2FA OTP [${otpCode}] logged to server console.`
      : 'A 6-digit security code has been sent to reshiftapp@gmail.com.',
    simulated: emailRes.simulated,
  }
}

/**
 * Verifies the 6-digit 2FA OTP submitted by the Super Admin.
 */
export function verifySuperAdmin2FA(otpCode: string): { success: boolean; message: string } {
  const cleanCode = otpCode.trim()
  const cached = superAdminOtpStore.get(SUPER_ADMIN_EMAIL)

  if (!cached) {
    return { success: false, message: 'No active 2FA verification session found. Please request a new code.' }
  }

  if (Date.now() > cached.expiresAt) {
    superAdminOtpStore.delete(SUPER_ADMIN_EMAIL)
    return { success: false, message: 'The 2FA code has expired. Please request a new one.' }
  }

  if (cached.attempts >= 5) {
    superAdminOtpStore.delete(SUPER_ADMIN_EMAIL)
    return { success: false, message: 'Too many incorrect attempts. Please request a new verification code.' }
  }

  if (cached.code !== cleanCode) {
    cached.attempts += 1
    return { success: false, message: `Incorrect code. ${5 - cached.attempts} attempt(s) remaining.` }
  }

  // Code is valid! Consume it.
  superAdminOtpStore.delete(SUPER_ADMIN_EMAIL)
  return { success: true, message: 'Two-factor authentication successful.' }
}
