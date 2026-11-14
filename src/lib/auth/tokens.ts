/**
 * Cryptographic Token Utilities for 2FA Sessions & 30-Day Trusted Devices
 * Built using Web Standard Crypto (crypto.subtle) so it can safely execute
 * in both Edge Middleware and Node.js Server environments.
 */

export const SUPER_ADMIN_EMAIL = 'reshiftapp@gmail.com'
export const TRUSTED_DEVICE_COOKIE_NAME = 'reshift_trusted_device'
export const SESSION_2FA_COOKIE_NAME = 'reshift_2fa_session'
export const TRUSTED_DEVICE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds
export const SESSION_2FA_MAX_AGE = 24 * 60 * 60 // 24 hours in seconds

export function getDeviceTrustSecret(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || 'reshift_2fa_device_secret_fallback_2026'
}

/**
 * Creates a cryptographically signed HMAC-SHA256 token.
 */
export async function createDeviceTrustToken(
  userId: string,
  maxAgeSeconds: number = TRUSTED_DEVICE_MAX_AGE
): Promise<{ token: string; maxAge: number }> {
  const expiry = Date.now() + maxAgeSeconds * 1000
  const secret = getDeviceTrustSecret()
  const encoder = new TextEncoder()

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const data = encoder.encode(`${userId}:${expiry}`)
  const signature = await crypto.subtle.sign('HMAC', key, data)
  const hashArray = Array.from(new Uint8Array(signature))
  const hexHmac = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  return {
    token: `${userId}.${expiry}.${hexHmac}`,
    maxAge: maxAgeSeconds,
  }
}

/**
 * Verifies an HMAC-SHA256 token against the user ID and expiration.
 */
export async function verifyDeviceTrustToken(
  token: string | undefined | null,
  userId: string
): Promise<boolean> {
  if (!token) return false

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const [tokenUserId, expiryStr, hexHmac] = parts
    if (tokenUserId !== userId) return false

    const expiry = Number(expiryStr)
    if (isNaN(expiry) || Date.now() > expiry) return false

    const secret = getDeviceTrustSecret()
    const encoder = new TextEncoder()

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const data = encoder.encode(`${tokenUserId}:${expiryStr}`)
    const signature = new Uint8Array(
      (hexHmac.match(/.{1,2}/g) || []).map((b) => parseInt(b, 16))
    )

    return await crypto.subtle.verify('HMAC', key, signature, data)
  } catch (err) {
    console.error('Error verifying device trust token:', err)
    return false
  }
}
