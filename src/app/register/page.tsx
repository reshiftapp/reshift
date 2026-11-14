'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import {
  User,
  Mail,
  Lock,
  UploadCloud,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  Check,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Briefcase,
} from 'lucide-react'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [city, setCity] = useState('Kochi')
  const [requestedRole, setRequestedRole] = useState('volunteer')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [idCardUrl, setIdCardUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [submittedSuccess, setSubmittedSuccess] = useState(false)

  // Real-time validations
  const isNameValid = /^[a-zA-Z\s]{2,50}$/.test(fullName.trim())
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const isMobileValid = /^[6-9]\d{9}$/.test(mobileNumber.trim())

  // Password rules
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber
  const doPasswordsMatch = password.length > 0 && password === confirmPassword

  const handleIdCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, or WebP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit.')
      return
    }

    setUploadingImage(true)
    setErrorMsg(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'id-cards')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to upload ID card')
      }

      setIdCardUrl(data.url)
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading ID card image.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!isNameValid) {
      setErrorMsg('Name must contain only alphabetic letters and spaces (2-50 characters).')
      return
    }

    if (!isEmailValid) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    if (!isMobileValid) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number without +91 (must start with 6-9).')
      return
    }

    if (!isPasswordValid) {
      setErrorMsg('Password must be at least 8 characters long with uppercase, lowercase, and numeric digits.')
      return
    }

    if (!doPasswordsMatch) {
      setErrorMsg('Password confirmation does not match.')
      return
    }

    if (!idCardUrl) {
      setErrorMsg('Please upload an image of your Company / Volunteer ID Card.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register-volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          mobileNumber,
          city,
          requestedRole,
          password,
          confirmPassword,
          idCardUrl,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.')
      }

      setSubmittedSuccess(true)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit registration application.')
    } finally {
      setLoading(false)
    }
  }

  if (submittedSuccess) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex flex-col justify-center items-center px-4 py-12 relative overflow-y-auto transition-colors">
        <div className="w-full max-w-lg bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 dark:text-amber-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Application Submitted!</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Your details and Company ID have been submitted to the Super Admin queue for review.
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 text-left space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/80">
              <span className="text-zinc-500 dark:text-zinc-400">Applicant:</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/80">
              <span className="text-zinc-500 dark:text-zinc-400">Email:</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/80">
              <span className="text-zinc-500 dark:text-zinc-400">Mobile (India):</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">+91 {mobileNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/80">
              <span className="text-zinc-500 dark:text-zinc-400">Target City:</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{city}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500 dark:text-zinc-400">Status:</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800/50">
                Pending Verification
              </span>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 text-left flex gap-3 items-start">
            <ShieldAlert className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <p>
              Portal access is restricted until the Super Admin verifies your company ID card. You will receive an
              official confirmation email once approved.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-2xs"
          >
            <span>Return to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-6 relative overflow-y-auto transition-colors">
      {/* Top Header with Brand and Tactile Theme Toggle */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between z-20">
        <Link href="/login" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/reshift-icon.png" alt="ReShift Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-white">
            ReShift <span className="text-zinc-500 dark:text-zinc-400 font-normal">| Staff Application</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Registration Content */}
      <div className="w-full max-w-xl mx-auto my-6 space-y-6 relative z-10 flex-1">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Staff & Volunteer Registration
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Join the city moderation team. Subject to Super Admin approval.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6 transition-colors">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl flex items-start gap-2.5 text-rose-800 dark:text-rose-300 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div>
                <strong className="block font-semibold text-rose-900 dark:text-rose-200 mb-0.5">Registration Error</strong>
                {errorMsg}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Full Name */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Full Name (Letters Only)
                </label>
                {fullName && (
                  <span className={`text-[11px] flex items-center gap-1 ${isNameValid ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-600 dark:text-rose-400'}`}>
                    {isNameValid ? <Check className="w-3 h-3" /> : 'Alphabetic characters only'}
                  </span>
                )}
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Official / Personal Email
                </label>
                {email && (
                  <span className={`text-[11px] flex items-center gap-1 ${isEmailValid ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-600 dark:text-rose-400'}`}>
                    {isEmailValid ? <Check className="w-3 h-3" /> : 'Invalid format'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="rahul@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Mobile Number (India Exclusive) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Mobile Number (India Only)
                </label>
                {mobileNumber && (
                  <span className={`text-[11px] flex items-center gap-1 ${isMobileValid ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-600 dark:text-rose-400'}`}>
                    {isMobileValid ? <Check className="w-3 h-3" /> : 'Must be 10 digits (6-9)'}
                  </span>
                )}
              </div>
              <div className="flex rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors">
                <div className="bg-zinc-100 dark:bg-zinc-800/80 px-3.5 py-2.5 flex items-center gap-1.5 border-r border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold select-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                Enter 10-digit number without country code or spaces.
              </p>
            </div>

            {/* City & Role Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Primary Operational City
                </label>
                <div className="relative">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="Kochi">Kochi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Trivandrum">Trivandrum</option>
                    <option value="Kozhikode">Kozhikode</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Requested Role
                </label>
                <div className="relative">
                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="volunteer">City Volunteer</option>
                    <option value="moderator">Community & Housing Moderator</option>
                    <option value="content_editor">Content & Guide Editor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              {/* Live Strength Checklist */}
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

            {/* Confirm Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Confirm Password
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

            {/* Company / Official ID Card Uploader */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Official Company / Student ID Card Photo (Required)
              </label>
              <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-all bg-zinc-50/70 dark:bg-zinc-900/40">
                {idCardUrl ? (
                  <div className="space-y-3">
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={idCardUrl} alt="Uploaded ID Card" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center justify-between px-2 text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> ID Card Attached
                      </span>
                      <button
                        type="button"
                        onClick={() => setIdCardUrl('')}
                        className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        Replace Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="idCardUpload"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleIdCardUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <label
                      htmlFor="idCardUpload"
                      className="cursor-pointer flex flex-col items-center justify-center py-4 space-y-2"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">Uploading ID to Secure Storage...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                              Click to upload ID photo
                            </span>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">JPG, PNG, or WebP up to 5MB</p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Submission Button - Guaranteed Visible with Native Scroll */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit for Super Admin Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400">
            Already registered?{' '}
            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              Sign In here
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle Footer */}
      <footer className="w-full max-w-xl mx-auto text-center text-[11px] text-zinc-400 dark:text-zinc-600 z-20 py-4">
        © {new Date().getFullYear()} ReShift Technologies Inc. All rights reserved.
      </footer>
    </div>
  )
}
