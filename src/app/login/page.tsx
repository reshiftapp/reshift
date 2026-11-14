'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Loader2,
  ShieldAlert,
  LogOut,
  KeyRound,
  RotateCcw,
  Check,
  Laptop,
} from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [pendingNotice, setPendingNotice] = useState<string | null>(null)

  // 2-Step Verification states
  const [loginStep, setLoginStep] = useState<'credentials' | '2fa'>('credentials')
  const [otpCode, setOtpCode] = useState('')
  const [trustDevice, setTrustDevice] = useState(true)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendNotice, setResendNotice] = useState<string | null>(null)

  // Active session detection
  const [activeUser, setActiveUser] = useState<{
    email: string
    isSuperAdmin: boolean
    isTrusted: boolean
  } | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  // Cooldown timer for 2FA resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const stepParam = searchParams.get('step')

    if (errorParam === 'pending') {
      setPendingNotice(
        'Your staff/volunteer registration is currently pending review by Super Admin. You will receive an email once approved.'
      )
    } else if (errorParam === 'unauthorized') {
      setErrorMsg('Access denied. You must be an authorized Super Admin or approved staff member to enter.')
    }

    // Check if browser already has an active Supabase session
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const meta = user.user_metadata || {}
        const isSuperAdmin =
          user.email?.toLowerCase() === 'reshiftapp@gmail.com' || meta.role === 'super_admin'

        if (isSuperAdmin) {
          // Check if this device is trusted or has valid 2FA session
          try {
            const checkRes = await fetch('/api/auth/2fa/check-trusted', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email }),
            }).then((r) => r.json())

            if (checkRes.trusted) {
              // Device is verified for 30 days
              setActiveUser({
                email: user.email || '',
                isSuperAdmin: true,
                isTrusted: true,
              })
            } else {
              // Active session exists, but 2FA is required for this device!
              setEmail(user.email || 'reshiftapp@gmail.com')
              setLoginStep('2fa')
              // Trigger code dispatch
              fetch('/api/auth/2fa/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email }),
              }).catch(console.error)
              setResendCooldown(60)
            }
          } catch (err) {
            console.error('Session trust check error:', err)
          }
        } else {
          // Staff volunteer
          setActiveUser({
            email: user.email || '',
            isSuperAdmin: false,
            isTrusted: true,
          })
        }
      } else if (stepParam === '2fa') {
        setEmail('reshiftapp@gmail.com')
        setLoginStep('2fa')
      }
      setCheckingSession(false)
    })
  }, [searchParams])

  const handleSignOutActive = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      await fetch('/api/auth/signout', { method: 'POST' })
    } catch (e) {
      console.error('Sign out error:', e)
    } finally {
      setActiveUser(null)
      setLoginStep('credentials')
      setEmail('')
      setPassword('')
      setOtpCode('')
      setErrorMsg(null)
      setPendingNotice(null)
      setLoading(false)
      router.refresh()
    }
  }

  // Step 1: Verify Password credentials
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setPendingNotice(null)
    setResendNotice(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.')
        setLoading(false)
        return
      }

      const user = data.user
      const meta = user?.user_metadata || {}
      const isSuperAdmin =
        user?.email?.toLowerCase() === 'reshiftapp@gmail.com' || meta.role === 'super_admin'

      // Case A: Regular Staff Volunteer Login (No 2FA required)
      if (!isSuperAdmin) {
        const isStaff = meta.is_staff === true || Boolean(meta.id_card_url) || Boolean(meta.idCardUrl)

        if (!isStaff) {
          // Mobile app customer, NOT staff
          await supabase.auth.signOut()
          await fetch('/api/auth/signout', { method: 'POST' })
          setErrorMsg(
            'Access denied. This portal is strictly for authorized ReShift staff and administrators. Customers must use the ReShift mobile application.'
          )
          setLoading(false)
          return
        }

        const approvalStatus = meta.approval_status || 'pending'

        if (approvalStatus === 'pending') {
          await supabase.auth.signOut()
          await fetch('/api/auth/signout', { method: 'POST' })
          setPendingNotice(
            'Your registration application is currently pending review by the Super Admin. You will receive an email once your company ID card has been verified.'
          )
          setLoading(false)
          return
        }

        if (approvalStatus === 'rejected') {
          await supabase.auth.signOut()
          await fetch('/api/auth/signout', { method: 'POST' })
          setErrorMsg(
            `Your application was not approved. Reason: ${meta.rejection_reason || 'Verification requirements not met.'}`
          )
          setLoading(false)
          return
        }

        // Approved Staff: Enter dashboard immediately
        const redirectUrl = searchParams.get('redirect') || '/'
        window.location.href = redirectUrl
        return
      }

      // Case B: Super Administrator Login (Requires 2-Step OTP unless 30-day device is trusted)
      const checkRes = await fetch('/api/auth/2fa/check-trusted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      }).then((r) => r.json()).catch(() => ({ trusted: false }))

      if (checkRes.trusted) {
        // Device is verified for 30 days! Bypass OTP directly
        const redirectUrl = searchParams.get('redirect') || '/'
        window.location.href = redirectUrl
        return
      }

      // Untrusted Device: Send 6-digit OTP code to Super Admin email
      const sendRes = await fetch('/api/auth/2fa/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      }).then((r) => r.json()).catch((err) => ({ success: false, message: err.message }))

      if (!sendRes.success) {
        setErrorMsg(sendRes.message || 'Failed to dispatch 2FA security code. Please try again.')
        setLoading(false)
        return
      }

      // Transition smoothly to Step 2 (2FA OTP verification screen)
      setLoginStep('2fa')
      setResendCooldown(60)
      setResendNotice(
        sendRes.simulated
          ? 'Development mode: 6-digit OTP code has been output to the server console.'
          : 'A 6-digit security code has been sent to reshiftapp@gmail.com.'
      )
      setLoading(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during login.')
      setLoading(false)
    }
  }

  // Step 2: Verify 6-digit 2FA OTP & apply 30-day device trust
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setResendNotice(null)

    const cleanOtp = otpCode.trim()
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setErrorMsg('Please enter a valid 6-digit numeric verification code.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'reshiftapp@gmail.com',
          otpCode: cleanOtp,
          trustDevice,
        }),
      }).then((r) => r.json())

      if (!res.success) {
        setErrorMsg(res.message || 'Verification failed. Please check the code and try again.')
        setLoading(false)
        return
      }

      // 2FA Verified successfully! Redirect to protected dashboard
      const redirectUrl = searchParams.get('redirect') || '/'
      window.location.href = redirectUrl
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during verification.')
      setLoading(false)
    }
  }

  // Resend 2FA OTP Code
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return
    setErrorMsg(null)
    setResendNotice(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/2fa/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'reshiftapp@gmail.com' }),
      }).then((r) => r.json())

      if (res.success) {
        setResendNotice(
          res.simulated
            ? 'New simulated OTP code logged to server console.'
            : 'A fresh 6-digit verification code has been dispatched to your email.'
        )
        setResendCooldown(60)
      } else {
        setErrorMsg(res.message || 'Failed to dispatch a new code.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 relative z-10">
      {/* Brand Header */}
      <div className="text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-0.5 bg-white dark:bg-[#111113] mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/reshift-icon.png" alt="ReShift Logo" className="w-full h-full object-cover rounded-xl" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {loginStep === '2fa' ? 'Two-Step Verification' : 'ReShift Moderator Portal'}
        </h1>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {loginStep === '2fa'
            ? 'Super Admin identity verification required'
            : 'Sign in to manage properties, local spots, and operations'}
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl p-7 shadow-sm space-y-5 transition-colors">
        {/* Active Session Notice (Only shown if already fully trusted or staff) */}
        {activeUser && loginStep === 'credentials' && (
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                Active Session Detected
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
                {activeUser.isSuperAdmin ? 'Super Admin (Trusted)' : 'Staff Volunteer'}
              </span>
            </div>
            <div className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
              {activeUser.email}
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              You are currently authenticated in this browser. You can proceed directly to the portal or sign out to enter a different account.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-2xs transition-colors"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleSignOutActive}
                disabled={loading}
                className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Pending Review Notice */}
        {pendingNotice && (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <strong className="block font-semibold text-amber-900 dark:text-amber-200 mb-0.5">Registration Pending Review</strong>
              {pendingNotice}
            </div>
          </div>
        )}

        {/* Resend / Info Notice */}
        {resendNotice && (
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl flex items-start gap-2.5 text-blue-800 dark:text-blue-300 text-xs leading-relaxed">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>{resendNotice}</div>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl flex items-start gap-2.5 text-rose-800 dark:text-rose-300 text-xs leading-relaxed">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div>
              <strong className="block font-semibold text-rose-900 dark:text-rose-200 mb-0.5">Authentication Restricted</strong>
              {errorMsg}
            </div>
          </div>
        )}

        {/* STEP 1: CREDENTIALS (EMAIL + PASSWORD) */}
        {loginStep === 'credentials' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Authorized Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="reshiftapp@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: SUPER ADMIN 2FA OTP + 30-DAY TRUST CHECKBOX */}
        {loginStep === '2fa' && (
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-1 text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-1">
                <KeyRound className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                Enter 6-Digit Security Code
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Code sent to <span className="font-medium text-zinc-700 dark:text-zinc-300">reshiftapp@gmail.com</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 text-center">
                One-Time Password (OTP)
              </label>
              <input
                type="text"
                required
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setOtpCode(val)
                }}
                className="w-full text-center text-xl font-mono tracking-[0.4em] py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-bold"
              />
            </div>

            {/* Trust this device for 30 days option */}
            <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-200">
                    <Laptop className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                    <span>Trust this device for 30 days</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                    You will not be asked for a 2FA code on this browser for the next 30 days.
                  </p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.trim().length !== 6}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Verify & Enter Dashboard</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>
                  {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSignOutActive}
                disabled={loading}
                className="text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                Cancel & Sign Out
              </button>
            </div>
          </form>
        )}

        {/* Quick info footer */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-center space-y-2">
          {loginStep === 'credentials' && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Want to join as a city staff volunteer?{' '}
              <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                Apply here
              </Link>
            </p>
          )}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secured with Brevo OTP & Supabase Auth</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-6 relative overflow-hidden transition-colors">
      {/* Top Header with Brand and Tactile Theme Toggle */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-20">
        <Link href="/login" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/reshift-icon.png" alt="ReShift Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-white">
            ReShift <span className="text-zinc-500 dark:text-zinc-400 font-normal">| Moderator Portal</span>
          </span>
        </Link>

        {/* The Theme Toggle requested by user */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex items-center justify-center my-8">
        <Suspense fallback={<Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />}>
          <LoginForm />
        </Suspense>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center text-[11px] text-zinc-400 dark:text-zinc-600 z-20">
        © {new Date().getFullYear()} ReShift Technologies Inc. All rights reserved.
      </footer>
    </div>
  )
}
