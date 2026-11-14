'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import {
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  XCircle,
  Check,
  ShieldCheck,
} from 'lucide-react'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [simulatedNotice, setSimulatedNotice] = useState<string | null>(null)

  // Password rules
  const hasMinLength = newPassword.length >= 8
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasLowercase = /[a-z]/.test(newPassword)
  const hasNumber = /\d/.test(newPassword)
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber
  const doPasswordsMatch = newPassword.length > 0 && newPassword === confirmPassword

  // Step 1: Dispatch OTP via Brevo
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSimulatedNotice(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send OTP code.')
      }

      if (data.simulated) {
        setSimulatedNotice(data.message)
      }

      setStep(2)
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending password reset email.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify 6-digit OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otpCode: otpCode.trim() }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid verification code.')
      }

      setStep(3)
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Complete Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!isPasswordValid) {
      setErrorMsg('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers.')
      return
    }

    if (!doPasswordsMatch) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otpCode: otpCode.trim(),
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password.')
      }

      setStep(4)
    } catch (err: any) {
      setErrorMsg(err.message || 'Error resetting password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-6 relative overflow-y-auto transition-colors">
      {/* Top Header with Brand and Tactile Theme Toggle */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between z-20">
        <Link href="/login" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/reshift-icon.png" alt="ReShift Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-white">
            ReShift <span className="text-zinc-500 dark:text-zinc-400 font-normal">| Password Recovery</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="w-full max-w-md mx-auto my-6 space-y-6 relative z-10 flex-1">
        {/* Brand Header */}
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Password Recovery</h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {step === 1 && 'Enter your account email to receive a 6-digit Brevo OTP.'}
            {step === 2 && 'Enter the 6-digit verification code sent to your email.'}
            {step === 3 && 'Choose a strong new password for your account.'}
            {step === 4 && 'Your password has been successfully updated.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6 transition-colors">
          {/* Progress Indicators */}
          {step < 4 && (
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step >= 1 ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  1
                </span>
                <span className={`text-xs font-medium ${step >= 1 ? 'text-zinc-900 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'}`}>
                  Email
                </span>
              </div>
              <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step >= 2 ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  2
                </span>
                <span className={`text-xs font-medium ${step >= 2 ? 'text-zinc-900 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'}`}>
                  Verify OTP
                </span>
              </div>
              <div className={`w-8 h-0.5 ${step >= 3 ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step >= 3 ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  3
                </span>
                <span className={`text-xs font-medium ${step >= 3 ? 'text-zinc-900 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'}`}>
                  Reset
                </span>
              </div>
            </div>
          )}

          {/* Development simulated OTP notice */}
          {simulatedNotice && (
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl text-blue-800 dark:text-blue-300 text-xs">
              <strong>Simulated OTP Notice:</strong> {simulatedNotice}
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl flex items-start gap-2.5 text-rose-800 dark:text-rose-300 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div>
                <strong className="block font-semibold text-rose-900 dark:text-rose-200 mb-0.5">Action Failed</strong>
                {errorMsg}
              </div>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Registered Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@organization.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending 6-Digit OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 sm:space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Enter 6-Digit Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-lg font-mono tracking-widest text-zinc-900 dark:text-white text-center placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 text-center">
                  Check inbox & spam for security code sent to <strong className="text-zinc-700 dark:text-zinc-300">{email}</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                {/* Strength Checklist */}
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    8+ Characters
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    Uppercase (A-Z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    Lowercase (a-z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    Numeric (0-9)
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Confirm New Password
                  </label>
                  {confirmPassword && (
                    <span className={`text-[11px] flex items-center gap-1 ${doPasswordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-600 dark:text-rose-400'}`}>
                      {doPasswordsMatch ? <Check className="w-3 h-3" /> : 'Passwords do not match'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid || !doPasswordsMatch}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving New Password...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Update Password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="text-center space-y-5 py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Password Updated!</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  You can now log in using your newly configured password.
                </p>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-2xs"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle Footer */}
      <footer className="w-full max-w-md mx-auto text-center text-[11px] text-zinc-400 dark:text-zinc-600 z-20 py-4">
        © {new Date().getFullYear()} ReShift Technologies Inc. All rights reserved.
      </footer>
    </div>
  )
}
