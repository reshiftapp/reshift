'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Home,
  Bus,
  UtensilsCrossed,
  Calendar,
  ShoppingBag,
  BookOpen,
  Wifi,
  Building2,
  AlertTriangle,
  MessageSquare,
  Image as ImageIcon,
  Bell,
  LifeBuoy,
  Settings,
  ShieldCheck,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  superAdminOnly?: boolean
}

const navItems: NavItem[] = [
  { title: 'Overview', href: '/', icon: LayoutDashboard },
  { title: 'Staff Approvals', href: '/approvals', icon: UserCheck, superAdminOnly: true },
  { title: 'App Customers', href: '/users', icon: Users },
  { title: 'Housing / PGs', href: '/housing', icon: Home },
  { title: 'Transport & Buses', href: '/transport', icon: Bus },
  { title: 'Food & Places', href: '/food', icon: UtensilsCrossed },
  { title: 'Events Calendar', href: '/events', icon: Calendar },
  { title: 'Essentials', href: '/essentials', icon: ShoppingBag },
  { title: 'Local Guides', href: '/guides', icon: BookOpen },
  { title: 'Internet & SIM', href: '/internet', icon: Wifi },
  { title: 'Bank & Medical', href: '/services', icon: Building2 },
  { title: 'Emergency SOS', href: '/emergency', icon: AlertTriangle },
  { title: 'Community Feed', href: '/community', icon: MessageSquare },
  { title: 'Carousels & Banners', href: '/carousels', icon: ImageIcon },
  { title: 'Push Notifications', href: '/notifications', icon: Bell },
  { title: 'Support Tickets', href: '/tickets', icon: LifeBuoy },
  { title: 'App Settings & Cities', href: '/settings', icon: Settings, superAdminOnly: true },
  { title: 'Audit Trail', href: '/audit-log', icon: ShieldCheck, superAdminOnly: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isSuperAdmin } = useAuth()

  const visibleNavItems = navItems.filter((item) => !item.superAdminOnly || isSuperAdmin)

  return (
    <aside className="w-60 bg-white dark:bg-[#0c0c0e] border-r border-zinc-200 dark:border-white/10 flex flex-col flex-shrink-0 min-h-screen text-zinc-600 dark:text-zinc-400 select-none transition-colors">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-200 dark:border-white/10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0 border border-zinc-200 dark:border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/reshift-icon.png" alt="ReShift Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-semibold text-zinc-900 dark:text-white text-sm tracking-tight leading-none">Reshift</div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-1">Moderator Portal</div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Core Operations
        </div>
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group',
                isActive
                  ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-white font-medium before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-indigo-600 dark:before:bg-indigo-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/60'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300')} />
                <span>{item.title}</span>
              </div>
              {isActive && <ChevronRight className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-zinc-200 dark:border-white/10 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
        <span>Reshift v1.0 Live</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="System Live" />
      </div>
    </aside>
  )
}
