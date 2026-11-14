'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import {
  User,
  Mail,
  Phone,
  Lock,
  UploadCloud,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  Building,
  Image as ImageIcon,
  Check,
  ShieldAlert,
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
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Application Submitted!</h2>
            <p className="text-sm text-slate-400">
              Your details and Company ID have been submitted to the Super Admin queue.
            </p>
          </div>

          <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800 text-left space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-500">Applicant:</span>
              <span className="font-medium text-slate-200">{fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-500">Email:</span>
              <span className="font-medium text-slate-200">{email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-500">Mobile (India):</span>
              <span className="font-medium text-slate-200">+91 {mobileNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-500">Target City:</span>
              <span className="font-medium text-slate-200">{city}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/30">
                Pending Verification
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/60 rounded-xl text-xs text-slate-400 text-left flex gap-3 items-start">
            <ShieldAlert className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p>
              Login access is blocked until the Super Admin verifies your company ID. Once approved, you will receive a
              confirmation email with full dashboard access.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30"
          >
            <span>Return to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-6 relative overflow-hidden transition-colors">
      {/* Top Header with Brand and Tactile Theme Toggle */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between z-20">
        <Link href="/login" className="flex items-center gap-2">
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

      <div className="w-full max-w-xl mx-auto my-6 space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Staff & Volunteer Registration</h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Join the city moderation team. Subject to Super Admin approval.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl p-7 shadow-sm space-y-6 transition-colors">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-300 text-xs leading-relaxed">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              <div>
                <strong className="block font-semibold text-red-200 mb-0.5">Registration Error</strong>
                {errorMsg}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">Full Name (Letters Only)</label>
                {fullName && (
                  <span className={`text-[11px] flex items-center gap-1 ${isNameValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isNameValid ? <Check className="w-3 h-3" /> : 'Alphabetic characters only'}
                  </span>
                )}
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">Official / Personal Email</label>
                {email && (
                  <span className={`text-[11px] flex items-center gap-1 ${isEmailValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isEmailValid ? <Check className="w-3 h-3" /> : 'Invalid format'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="rahul@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Mobile Number (India Exclusive) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">Mobile Number (India Only)</label>
                {mobileNumber && (
                  <span className={`text-[11px] flex items-center gap-1 ${isMobileValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isMobileValid ? <Check className="w-3 h-3" /> : 'Must be 10 digits (6-9)'}
                  </span>
                )}
              </div>
              <div className="flex rounded-xl overflow-hidden border border-slate-700/80 bg-slate-800/80 focus-within:ring-2 focus-within:ring-indigo-500">
                <div className="bg-slate-700/60 px-3.5 py-2.5 flex items-center gap-1.5 border-r border-slate-700 text-slate-200 text-xs font-semibold select-none">
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
                  className="w-full px-4 py-2.5 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Enter 10-digit number without country code or spaces.</p>
            </div>

            {/* City & Role Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Primary Operational City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Requested Role</label>
                <select
                  value={requestedRole}
                  onChange={(e) => setRequestedRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="volunteer">City Volunteer</option>
                  <option value="moderator">Community & Housing Moderator</option>
                  <option value="content_editor">Content & Guide Editor</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Live Strength Checklist */}
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  8+ Characters
                </span>
                <span className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  Uppercase (A-Z)
                </span>
                <span className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  Lowercase (a-z)
                </span>
                <span className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  Numeric (0-9)
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">Confirm Password</label>
                {confirmPassword && (
                  <span className={`text-[11px] flex items-center gap-1 ${doPasswordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                    {doPasswordsMatch ? <Check className="w-3 h-3" /> : 'Passwords do not match'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Company / Official ID Card Uploader */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Official Company / Student ID Card Photo (Required)
              </label>
              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-4 text-center hover:border-indigo-500/50 transition-all bg-slate-800/40">
                {idCardUrl ? (
                  <div className="space-y-3">
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={idCardUrl} alt="Uploaded ID Card" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center justify-between px-2 text-xs">
                      <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> ID Card Attached
                      </span>
                      <button
                        type="button"
                        onClick={() => setIdCardUrl('')}
                        className="text-red-400 hover:text-red-300 underline cursor-pointer"
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
                          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                          <span className="text-xs text-slate-400">Uploading ID to Secure Storage...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-indigo-400 hover:underline">Click to upload ID photo</span>
                            <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, or WebP up to 5MB</p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60 cursor-pointer"
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
          </form>

          <div className="text-center pt-3 border-t border-slate-800 text-xs text-slate-400">
            Already registered?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
