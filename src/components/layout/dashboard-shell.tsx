'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { Loader2, ShieldCheck } from 'lucide-react'

const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading, isSuperAdmin, isStaff } = useAuth()
  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  // Auth routes (login, register, forgot-password) are rendered directly
  if (isAuthRoute) {
    return <main className="w-full min-h-screen bg-slate-950 overflow-y-auto">{children}</main>
  }

  // Dashboard routes: While checking session
  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-slate-800 p-1 bg-slate-900 animate-pulse">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/reshift-icon.png" alt="ReShift Logo" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Verifying Authorized Session...</span>
        </div>
      </div>
    )
  }

  // If session is missing or unauthorized
  if (!user || (!isSuperAdmin && !isStaff)) {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 text-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-slate-400 mt-1">Please log in with authorized credentials to access the ReShift Control Panel.</p>
        </div>
        <a
          href="/login"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30"
        >
          Go to Sign In
        </a>
      </div>
    )
  }

  // Render Full Authenticated Dashboard Shell
  return (
    <div className="flex w-full h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-950">{children}</main>
      </div>
    </div>
  )
}
