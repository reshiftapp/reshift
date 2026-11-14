'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Loader2, ShieldAlert } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [pendingNotice, setPendingNotice] = useState<string | null>(null)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'pending') {
      setPendingNotice(
        'Your staff/volunteer registration is currently pending review by Super Admin. You will receive an email once approved.'
      )
    } else if (errorParam === 'unauthorized') {
      setErrorMsg('Access denied. You must be an authorized Super Admin or approved staff member to enter.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setPendingNotice(null)
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
      const isSuperAdmin = user?.email === 'reshiftapp@gmail.com' || meta.role === 'super_admin'

      // Check if user is authorized staff or super admin
      if (!isSuperAdmin) {
        // Is this user a staff member?
        const isStaff = meta.is_staff === true || Boolean(meta.id_card_url) || Boolean(meta.idCardUrl)

        if (!isStaff) {
          // This is a mobile app customer, NOT staff!
          await supabase.auth.signOut()
          setErrorMsg(
            'Access denied. This portal is strictly for authorized ReShift staff and administrators. Customers must use the ReShift mobile application.'
          )
          setLoading(false)
          return
        }

        const approvalStatus = meta.approval_status || 'pending'

        if (approvalStatus === 'pending') {
          await supabase.auth.signOut()
          setPendingNotice(
            'Your registration application is currently pending review by the Super Admin. You will receive an email once your company ID card has been verified.'
          )
          setLoading(false)
          return
        }

        if (approvalStatus === 'rejected') {
          await supabase.auth.signOut()
          setErrorMsg(
            `Your application was not approved. Reason: ${meta.rejection_reason || 'Verification requirements not met.'}`
          )
          setLoading(false)
          return
        }
      }

      // Successful login
      const redirectUrl = searchParams.get('redirect') || '/'
      router.push(redirectUrl)
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during login.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 relative z-10">
      {/* Brand Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden shadow-xl shadow-indigo-500/20 border border-slate-800 flex items-center justify-center p-1 bg-slate-900 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/reshift-icon.png" alt="ReShift Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">ReShift Control Panel</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to moderate and manage urban relocation operations</p>
      </div>

      {/* Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Pending Review Notice */}
        {pendingNotice && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-amber-300 text-xs leading-relaxed">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong className="block font-semibold text-amber-200 mb-1">Registration Pending Review</strong>
              {pendingNotice}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-300 text-xs leading-relaxed">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
            <div>
              <strong className="block font-semibold text-red-200 mb-0.5">Authentication Restricted</strong>
              {errorMsg}
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Authorized Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="admin@reshift.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick info footer */}
        <div className="pt-4 border-t border-slate-800/80 text-center space-y-3">
          <p className="text-xs text-slate-400">
            Want to join as a city staff volunteer?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
              Apply here
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secured with Brevo OTP & Supabase Auth</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
