'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCity, CITIES } from '@/contexts/city-context'
import { useRealtime } from '@/contexts/realtime-context'
import { useAuth } from '@/contexts/auth-context'
import { 
  MapPin, 
  Search, 
  Bell, 
  ShieldCheck, 
  ChevronDown, 
  Check, 
  Radio, 
  ExternalLink,
  LogOut,
  UserCheck,
  KeyRound
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Topbar() {
  const router = useRouter()
  const { user, isSuperAdmin, isStaff, userRole, signOut } = useAuth()
  const { city, setCity, cities, cityMetadata } = useCity()
  const { status } = useRealtime()
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const displayName = user?.user_metadata?.full_name || (isSuperAdmin ? 'ReShift Admin' : 'Staff Volunteer')
  const email = user?.email || (isSuperAdmin ? 'reshiftapp@gmail.com' : 'staff@reshift.app')
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'RA'

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: City Switcher & Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* City Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 text-sm font-medium text-slate-200 transition-colors"
          >
            <MapPin className="w-4 h-4 text-[#5B6FD0]" />
            <span>{cityMetadata.label}</span>
            <span className="text-xs text-slate-400">({cityMetadata.state})</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {cityDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setCityDropdownOpen(false)} 
              />
              <div className="absolute left-0 mt-2 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-xl shadow-black/40 py-2 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60 mb-1">
                  Scope Data by City
                </div>
                {cities.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setCity(c.name)
                      setCityDropdownOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-700/60 transition-colors',
                      city === c.name ? 'text-[#5B6FD0] font-semibold bg-indigo-500/10' : 'text-slate-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      <span>{c.label}</span>
                    </div>
                    {city === c.name && <Check className="w-4 h-4 text-[#5B6FD0]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden md:block w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search properties, users, posts..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#5B6FD0] focus:ring-1 focus:ring-[#5B6FD0] transition-colors"
          />
        </div>
      </div>

      {/* Right Controls: Realtime Dot, Live Mobile Link, Profile */}
      <div className="flex items-center gap-4">
        {/* Realtime Connection Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-300">
          <span 
            className={cn(
              "w-2 h-2 rounded-full",
              status === 'connected' ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            )} 
          />
          <span className="capitalize">{status === 'connected' ? 'Supabase Live' : 'Connecting...'}</span>
        </div>

        {/* User / Moderator Profile Card with Dropdown */}
        <div className="relative pl-2 border-l border-slate-800">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5B6FD0] to-indigo-400 flex items-center justify-center text-white font-semibold text-xs shadow-md">
              {initials}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-200">{displayName}</div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                {isSuperAdmin ? (
                  <>
                    <ShieldCheck className="w-3 h-3" /> Super Admin
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3 h-3 text-indigo-400" /> Staff Volunteer
                  </>
                )}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-xl shadow-black/50 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-700/60">
                  <div className="text-xs font-semibold text-white truncate">{email}</div>
                  <div className="text-[10px] text-indigo-400 font-medium mt-0.5 capitalize">
                    {isSuperAdmin ? 'Super Administrator' : userRole || 'Staff Volunteer'}
                  </div>
                </div>

                <div className="py-1">
                  {isSuperAdmin && (
                    <Link
                      href="/approvals"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>Staff Approvals Queue</span>
                    </Link>
                  )}

                  <Link
                    href="/forgot-password"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-indigo-400" />
                    <span>Change / Reset Password</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-700/60">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      signOut()
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of Dashboard</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
