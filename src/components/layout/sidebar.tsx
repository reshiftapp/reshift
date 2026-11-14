'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
}

const navItems: NavItem[] = [
  { title: 'Overview', href: '/', icon: LayoutDashboard },
  { title: 'Staff Approvals', href: '/approvals', icon: UserCheck },
  { title: 'User Management', href: '/users', icon: Users },
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
  { title: 'App Settings', href: '/settings', icon: Settings },
  { title: 'Audit Trail', href: '/audit-log', icon: ShieldCheck },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 min-h-screen text-slate-300">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform flex-shrink-0 border border-slate-700/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/reshift-icon.png" alt="ReShift Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-tight leading-none">Reshift</div>
            <div className="text-[11px] text-indigo-400 font-medium mt-1">Moderator Portal</div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Core Operations
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-[#5B6FD0] text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
                <span>{item.title}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
        <span>Reshift v1.0 Production</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Live" />
      </div>
    </aside>
  )
}
