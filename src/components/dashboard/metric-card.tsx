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
    indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/20',
    sky: 'from-sky-500/20 to-sky-600/5 text-sky-400 border-sky-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20',
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-gradient-to-b bg-slate-900/90 border border-slate-800 p-6 shadow-lg shadow-black/20 hover:border-slate-700 transition-all",
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl border bg-gradient-to-tr", colorMap[colorScheme])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span className={trend.positive ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
            {trend.value}
          </span>
          <span className="text-slate-500">vs last period</span>
        </div>
      )}
    </div>
  )
}
