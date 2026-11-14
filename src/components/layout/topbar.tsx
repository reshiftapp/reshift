'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCity, CITIES } from '@/contexts/city-context'
import { useRealtime } from '@/contexts/realtime-context'
import { useAuth } from '@/contexts/auth-context'
import { ThemeToggle } from '@/components/layout/theme-toggle'
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
  KeyRound,
  Plus
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
    <header className="h-16 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/10 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: City Switcher & Search */}
      <div className="flex items-center gap-3">
        {/* City Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200/70 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 border border-zinc-200/80 dark:border-zinc-700/60 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors shadow-2xs"
          >
            <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{cityMetadata.label}</span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">({cityMetadata.state})</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
          </button>

          {cityDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setCityDropdownOpen(false)} 
              />
              <div className="absolute left-0 mt-1.5 w-56 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
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
                      'w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors',
                      city === c.name 
                        ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/60 dark:bg-indigo-950/30' 
                        : 'text-zinc-700 dark:text-zinc-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                      <span>{c.label}</span>
                    </div>
                    {city === c.name && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                ))}

                {isSuperAdmin && (
                  <div className="pt-1 mt-1 border-t border-zinc-100 dark:border-zinc-800/80 px-1.5 pb-0.5">
                    <Link
                      href="/settings"
                      onClick={() => setCityDropdownOpen(false)}
                      className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 rounded-lg transition-colors font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add New City</span>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden md:block w-64 lg:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search properties, users, posts..."
            className="w-full pl-8.5 pr-3 py-1.5 bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls: Theme Toggle, Realtime Dot, Profile */}
      <div className="flex items-center gap-3">
        {/* Tactile Theme Toggle (Sun/Moon) */}
        <ThemeToggle />

        {/* Realtime Connection Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
          <span 
            className={cn(
              "w-2 h-2 rounded-full",
              status === 'connected' ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            )} 
          />
          <span className="capitalize hidden sm:inline">{status === 'connected' ? 'Supabase Live' : 'Connecting...'}</span>
        </div>

        {/* User / Moderator Profile Card with Dropdown */}
        <div className="relative pl-2 border-l border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-semibold text-xs shadow-2xs">
              {initials}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{displayName}</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                {isSuperAdmin ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Super Admin
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Staff Volunteer
                  </>
                )}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-50 text-xs">
                <div className="px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{email}</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 capitalize">
                    {isSuperAdmin ? 'Super Administrator' : userRole || 'Staff Volunteer'}
                  </div>
                </div>

                <div className="py-1">
                  {isSuperAdmin && (
                    <Link
                      href="/approvals"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Staff Approvals Queue</span>
                    </Link>
                  )}

                  <Link
                    href="/forgot-password"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Change / Reset Password</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      signOut()
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
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
