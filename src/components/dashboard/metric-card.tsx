import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: string
    positive?: boolean
  }
  colorScheme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple'
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'indigo',
}: MetricCardProps) {
  const colorMap = {
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800/40',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/40',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/40',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/40',
    sky: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200/60 dark:border-sky-800/40',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-800/40',
  }

  return (
    <div className="rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-4.5 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1.5 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-2 rounded-lg border", colorMap[colorScheme])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center gap-1.5 text-[11px]">
          <span className={trend.positive ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-rose-600 dark:text-rose-400 font-semibold"}>
            {trend.value}
          </span>
          <span className="text-zinc-400 dark:text-zinc-500">vs last period</span>
        </div>
      )}
    </div>
  )
}
