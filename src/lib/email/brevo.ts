/**
 * Brevo (formerly Sendinblue) Transactional Email Service
 * Strictly loads credentials from environment variables.
 */

interface BrevoSendResult {
  success: boolean
  messageId?: string
  simulated?: boolean
  error?: string
}

export async function sendOtpEmail({
  toEmail,
  otpCode,
  recipientName = 'ReShift User',
}: {
  toEmail: string
  otpCode: string
  recipientName?: string
}): Promise<BrevoSendResult> {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || 'reshiftapp@gmail.com'
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'ReShift Security Team'

  // If Brevo API key is not yet configured, provide simulated logging for development
  if (!apiKey || apiKey === '' || apiKey.includes('your_brevo')) {
    console.log(`\n======================================================`)
    console.log(`[BREVO EMAIL SERVICE — SIMULATED OTP IN CONSOLE]`)
    console.log(`To: ${toEmail} (${recipientName})`)
    console.log(`One-Time Password (OTP): [ ${otpCode} ]`)
    console.log(`Valid for 10 minutes.`)
    console.log(`(Configure BREVO_API_KEY in .env.local to send live emails)`)
    console.log(`======================================================\n`)
    return { success: true, simulated: true }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 24px; }
          .container { max-width: 520px; margin: 0 auto; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; padding: 36px 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .logo { font-size: 24px; font-weight: 800; color: #818cf8; letter-spacing: -0.5px; margin-bottom: 24px; display: inline-block; }
          .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
          .desc { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
          .otp-card { background: linear-gradient(135deg, rgba(91,111,208,0.15) 0%, rgba(99,102,241,0.05) 100%); border: 1px solid #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ffffff; margin: 0; font-family: 'Courier New', monospace; }
          .expiry { font-size: 12px; color: #818cf8; margin-top: 8px; font-weight: 500; }
          .footer { font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">ReShift</div>
          <div class="title">Password Reset Verification</div>
          <p class="desc">Hello ${recipientName},<br>We received a request to reset your ReShift control panel password. Use the verification code below to authorize this change:</p>
          <div class="otp-card">
            <div class="otp-code">${otpCode}</div>
            <div class="expiry">Expires in 10 minutes • Do not share this code with anyone</div>
          </div>
          <p class="desc" style="font-size: 12px;">If you did not request a password reset, please ignore this email or contact the super administrator immediately at ${senderEmail}.</p>
          <div class="footer">
            © ${new Date().getFullYear()} ReShift. Secure Relocation Control Panel.
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: recipientName }],
        subject: `[ReShift] ${otpCode} is your Password Reset Code`,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      console.error('Brevo API error:', errData)
      return { success: false, error: errData?.message || 'Failed to send email via Brevo' }
    }

    const resData = await response.json()
    return { success: true, messageId: resData?.messageId }
  } catch (err: any) {
    console.error('Brevo network exception:', err)
    return { success: false, error: err.message || 'Network error communicating with Brevo' }
  }
}

export async function sendApprovalEmail({
  toEmail,
  recipientName,
  role = 'Volunteer / Moderator',
}: {
  toEmail: string
  recipientName: string
  role?: string
}): Promise<BrevoSendResult> {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || 'reshiftapp@gmail.com'
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'ReShift Security Team'

  if (!apiKey || apiKey === '' || apiKey.includes('your_brevo')) {
    console.log(`[BREVO SIMULATED] Approval email sent to: ${toEmail} (${recipientName}) as ${role}`)
    return { success: true, simulated: true }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; background-color: #020617; color: #f8fafc; padding: 24px;">
        <div style="max-width: 520px; margin: 0 auto; background: #0f172a; border-radius: 16px; padding: 32px; border: 1px solid #1e293b;">
          <h2 style="color: #4ade80; margin-top: 0;">Application Approved 🎉</h2>
          <p style="color: #94a3b8; line-height: 1.6;">Hello ${recipientName},</p>
          <p style="color: #94a3b8; line-height: 1.6;">Your company ID and registration details have been verified and approved by the Super Admin. You have been assigned the role: <strong style="color: #ffffff;">${role}</strong>.</p>
          <p style="color: #94a3b8; line-height: 1.6;">You can now log in to the ReShift Moderator Control Panel using your email and password.</p>
          <div style="margin: 28px 0; text-align: center;">
            <a href="http://localhost:3000/login" style="background: #5B6FD0; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Access Control Panel</a>
          </div>
          <div style="font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #1e293b; padding-top: 16px;">
            ReShift Relocation Platform
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: recipientName }],
        subject: `[ReShift] Application Approved — You can now log in`,
        htmlContent,
      }),
    })

    return { success: response.ok }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function sendRejectionEmail({
  toEmail,
  recipientName,
  reason,
}: {
  toEmail: string
  recipientName: string
  reason?: string
}): Promise<BrevoSendResult> {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || 'reshiftapp@gmail.com'
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'ReShift Security Team'

  if (!apiKey || apiKey === '' || apiKey.includes('your_brevo')) {
    console.log(`[BREVO SIMULATED] Rejection email sent to: ${toEmail} (${recipientName}). Reason: ${reason}`)
    return { success: true, simulated: true }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; background-color: #020617; color: #f8fafc; padding: 24px;">
        <div style="max-width: 520px; margin: 0 auto; background: #0f172a; border-radius: 16px; padding: 32px; border: 1px solid #1e293b;">
          <h2 style="color: #f87171; margin-top: 0;">Registration Update</h2>
          <p style="color: #94a3b8; line-height: 1.6;">Hello ${recipientName},</p>
          <p style="color: #94a3b8; line-height: 1.6;">Thank you for your interest in joining ReShift. After reviewing your submitted details and company ID card, the Super Admin could not approve your application at this time.</p>
          ${reason ? `<div style="background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 12px 16px; margin: 16px 0; color: #fca5a5; font-size: 14px;"><strong>Reason:</strong> ${reason}</div>` : ''}
          <p style="color: #94a3b8; font-size: 13px;">If you believe this was an error or wish to re-submit with updated documentation, please contact our administrative team at ${senderEmail}.</p>
        </div>
      </body>
    </html>
  `

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: recipientName }],
        subject: `[ReShift] Update regarding your registration application`,
        htmlContent,
      }),
    })

    return { success: response.ok }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function sendSuperAdmin2FAEmail({
  toEmail,
  otpCode,
}: {
  toEmail: string
  otpCode: string
}): Promise<BrevoSendResult> {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || 'reshiftapp@gmail.com'
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'ReShift Root Security'

  if (!apiKey || apiKey === '' || apiKey.includes('your_brevo')) {
    console.log(`\n======================================================`)
    console.log(`[BREVO EMAIL SERVICE — SUPER ADMIN 2FA OTP]`)
    console.log(`To: ${toEmail}`)
    console.log(`Super Admin Two-Factor Code: [ ${otpCode} ]`)
    console.log(`Valid for 10 minutes.`)
    console.log(`======================================================\n`)
    return { success: true, simulated: true }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 24px; }
          .container { max-width: 520px; margin: 0 auto; background-color: #111113; border-radius: 16px; border: 1px solid #27272a; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
          .logo { font-size: 22px; font-weight: 800; color: #6366f1; letter-spacing: -0.5px; margin-bottom: 20px; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); text-transform: uppercase; margin-bottom: 16px; }
          .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 10px; }
          .desc { font-size: 13px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px; }
          .otp-card { background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.4); border-radius: 12px; padding: 24px 20px; text-align: center; margin-bottom: 24px; }
          .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #ffffff; margin: 0; font-family: 'Courier New', Courier, monospace; }
          .expiry { font-size: 11px; color: #818cf8; margin-top: 10px; font-weight: 600; }
          .alert { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 8px; padding: 12px; font-size: 12px; color: #fca5a5; line-height: 1.5; margin-bottom: 20px; }
          .footer { font-size: 11px; color: #71717a; text-align: center; border-top: 1px solid #27272a; padding-top: 20px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">ReShift</div>
          <div class="badge">Root Governance Two-Factor Authentication</div>
          <div class="title">Super Admin Sign-In Verification</div>
          <p class="desc">A sign-in attempt was initiated for the root Super Administrator account (<strong>${toEmail}</strong>). Please enter the following single-use verification code to authenticate your session:</p>
          <div class="otp-card">
            <div class="otp-code">${otpCode}</div>
            <div class="expiry">Expires in 10 minutes • Do not disclose to anyone</div>
          </div>
          <div class="alert">
            <strong>Security Notice:</strong> If you did not initiate this login attempt, your password may be compromised. Please revoke all active sessions and change your root administrator password immediately.
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} ReShift Inc. Cryptographic Security Service.
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: 'ReShift Super Admin' }],
        subject: `[ReShift Security] ${otpCode} is your Super Admin 2FA Code`,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      console.error('Brevo API error for 2FA:', errData)
      return { success: false, error: errData?.message || 'Failed to dispatch 2FA email' }
    }

    const resData = await response.json()
    return { success: true, messageId: resData?.messageId }
  } catch (err: any) {
    console.error('Brevo 2FA dispatch exception:', err)
    return { success: false, error: err.message || 'Network error communicating with Brevo' }
  }
}
