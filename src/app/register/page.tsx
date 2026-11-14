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
  Building2,
  Briefcase,
  Phone,
  FileText,
  BadgeCheck,
  ArrowLeft,
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

  const isFormComplete =
    isNameValid &&
    isEmailValid &&
    isMobileValid &&
    isPasswordValid &&
    doPasswordsMatch &&
    Boolean(idCardUrl)

  const handleIdCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, or WebP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 5MB.')
      return
    }

    setErrorMsg(null)
    setUploadingImage(true)

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
        throw new Error(data.error || 'Failed to upload ID document.')
      }

      setIdCardUrl(data.url)
    } catch (err: any) {
      setErrorMsg(err.message || 'Image upload failed. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!isNameValid) {
      setErrorMsg('Please enter a valid legal name (alphabetic characters only).')
      return
    }

    if (!isEmailValid) {
      setErrorMsg('Please provide a valid work or personal email address.')
      return
    }

    if (!isMobileValid) {
      setErrorMsg('Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.')
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
          fullName: fullName.trim(),
          email: email.trim(),
          mobileNumber: mobileNumber.trim(),
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

  // Success State View
  if (submittedSuccess) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex flex-col justify-center items-center px-4 py-12 transition-colors">
        <div className="w-full max-w-lg bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 dark:text-amber-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Application Submitted</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Your details and identity document have been submitted to the Super Admin queue for verification.
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 text-left space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/80">
              <span className="text-zinc-500 dark:text-zinc-400">Applicant:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/80">
              <span className="text-zinc-500 dark:text-zinc-400">Email:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800/80">
              <span className="text-zinc-500 dark:text-zinc-400">Assigned City:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{city}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500 dark:text-zinc-400">Review Status:</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800/50">
                Pending Super Admin Audit
              </span>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 text-left flex gap-3 items-start">
            <ShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Dashboard credentials remain locked until the Super Admin confirms your ID document. You will receive an official notification once approved.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm"
          >
            <span>Return to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Staff Portal
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Portal Header */}
        <div className="bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm flex-shrink-0 bg-white dark:bg-zinc-900 p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/reshift-icon.png" alt="ReShift" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Staff & Volunteer Application
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Authorized portal for city moderators, content editors, and field volunteers.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 self-start sm:self-auto">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Gated Verification</span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl flex items-start gap-3 text-rose-800 dark:text-rose-300 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div>
                <strong className="block font-semibold text-rose-900 dark:text-rose-200 mb-0.5">Application Notice</strong>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="mt-6 space-y-6">
            {/* Section 1: Personal & Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-700 dark:text-zinc-300 font-semibold">
                  1
                </span>
                <span>Applicant Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Legal Name */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Full Legal Name
                    </label>
                    {fullName && (
                      <span className={`text-[11px] flex items-center gap-1 ${isNameValid ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-500'}`}>
                        {isNameValid ? <Check className="w-3 h-3" /> : 'Alphabetic only'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      name="staff_full_name"
                      autoComplete="off"
                      required
                      placeholder="Enter legal name as on ID"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Work or Personal Email
                    </label>
                    {email && (
                      <span className={`text-[11px] flex items-center gap-1 ${isEmailValid ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-500'}`}>
                        {isEmailValid ? <Check className="w-3 h-3" /> : 'Invalid email'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      name="staff_email"
                      autoComplete="off"
                      required
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Phone (Indian format) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Mobile Number (India Exclusive)
                  </label>
                  {mobileNumber && (
                    <span className={`text-[11px] flex items-center gap-1 ${isMobileValid ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-500'}`}>
                      {isMobileValid ? <Check className="w-3 h-3" /> : '10 digits starting 6-9'}
                    </span>
                  )}
                </div>
                <div className="flex rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors">
                  <div className="bg-zinc-100 dark:bg-zinc-800/90 px-3.5 py-2.5 flex items-center gap-1.5 border-r border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold select-none">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    name="staff_mobile"
                    autoComplete="off"
                    inputMode="numeric"
                    required
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Regional Placement & Staff Role */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-white/5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-700 dark:text-zinc-300 font-semibold">
                  2
                </span>
                <span>Role & Regional Placement</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Primary Operational City
                  </label>
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

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Requested Staff Role
                  </label>
                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="volunteer">City Volunteer (Listings & Discovery)</option>
                    <option value="moderator">Community & Housing Moderator</option>
                    <option value="content_editor">Content & City Guide Editor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Credentials & Security */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-white/5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-700 dark:text-zinc-300 font-semibold">
                  3
                </span>
                <span>Security Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Account Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      name="staff_new_password"
                      autoComplete="new-password"
                      required
                      placeholder="Create secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Confirm Password
                    </label>
                    {confirmPassword && (
                      <span className={`text-[11px] flex items-center gap-1 ${doPasswordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-500'}`}>
                        {doPasswordsMatch ? <Check className="w-3 h-3" /> : 'Mismatch'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      name="staff_confirm_password"
                      autoComplete="new-password"
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Compact Inline Password Criteria Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 border transition-colors ${
                    hasMinLength
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />}
                  8+ chars
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 border transition-colors ${
                    hasUppercase
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {hasUppercase ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />}
                  Uppercase (A-Z)
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 border transition-colors ${
                    hasLowercase
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {hasLowercase ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />}
                  Lowercase (a-z)
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 border transition-colors ${
                    hasNumber
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />}
                  Numeric (0-9)
                </span>
              </div>
            </div>

            {/* Section 4: Identity Verification Document */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-700 dark:text-zinc-300 font-semibold">
                    4
                  </span>
                  <span>Proof of Identity</span>
                </div>
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  Mandatory Verification
                </span>
              </div>

              <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 text-center bg-zinc-50/60 dark:bg-zinc-900/30 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-colors">
                {idCardUrl ? (
                  <div className="space-y-3">
                    <div className="w-full h-44 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={idCardUrl} alt="Uploaded Identity Document" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center justify-between px-1 text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Identity Document Attached
                      </span>
                      <button
                        type="button"
                        onClick={() => setIdCardUrl('')}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium cursor-pointer"
                      >
                        Remove & Replace
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
                      className="cursor-pointer flex flex-col items-center justify-center py-4 space-y-2.5"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                            Uploading document to encrypted storage...
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                              Upload Company, Student, or Volunteer ID Card
                            </span>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                              Supported formats: JPG, PNG, or WebP (Maximum 5MB)
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Section 5: Governance Disclaimer & Action Buttons */}
            <div className="pt-6 border-t border-zinc-100 dark:border-white/5 space-y-4">
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-start gap-3 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Super Admin Governance Notice:</strong> By submitting, you acknowledge that all staff applications undergo cryptographic identity verification by the Super Admin before login permissions are granted.
                </span>
              </div>

              {/* Submit Button - Guaranteed Visible, Prominent & High-Contrast */}
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Staff Application for Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                Already an authorized staff member?{' '}
                <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                  Sign in here
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-zinc-400 dark:text-zinc-600 py-2">
          © {new Date().getFullYear()} ReShift Technologies Inc. • Enterprise Governance & Staff Management
        </div>
      </div>
    </div>
  )
}
