'use client'

import React from 'react'
import Link from 'next/link'
import { PlusCircle, Bell, Home, Calendar, UtensilsCrossed } from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      label: 'Add Property',
      href: '/housing',
      icon: Home,
      accent: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Add Event',
      href: '/events',
      icon: Calendar,
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Add Food Spot',
      href: '/food',
      icon: UtensilsCrossed,
      accent: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Send Broadcast',
      href: '/notifications',
      icon: Bell,
      accent: 'text-rose-600 dark:text-rose-400',
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((act) => {
        const Icon = act.icon
        return (
          <Link
            key={act.label}
            href={act.href}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 shadow-2xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
          >
            <Icon className={`w-3.5 h-3.5 ${act.accent}`} />
            <span>{act.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
