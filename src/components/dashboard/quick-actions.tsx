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
      color: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30',
    },
    {
      label: 'Add Event',
      href: '/events',
      icon: Calendar,
      color: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
    },
    {
      label: 'Add Food Spot',
      href: '/food',
      icon: UtensilsCrossed,
      color: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
    },
    {
      label: 'Send Broadcast',
      href: '/notifications',
      icon: Bell,
      color: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((act) => {
        const Icon = act.icon
        return (
          <Link
            key={act.label}
            href={act.href}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all hover:scale-[1.02] ${act.color}`}
          >
            <Icon className="w-4 h-4" />
            <span>{act.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
