'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface OverviewChartsProps {
  registrationTrends: { date: string; users: number }[]
  categoryDistribution: { category: string; count: number }[]
  roleDistribution: { role: string; count: number }[]
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']

export function OverviewCharts({
  registrationTrends,
  categoryDistribution,
  roleDistribution,
}: OverviewChartsProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme === 'dark' : true
  const gridStroke = isDark ? '#27272a' : '#e4e4e7'
  const textStroke = isDark ? '#71717a' : '#a1a1aa'
  const tooltipStyle = {
    backgroundColor: isDark ? '#111113' : '#ffffff',
    borderColor: isDark ? '#27272a' : '#e4e4e7',
    borderRadius: '8px',
    color: isDark ? '#f4f4f5' : '#09090b',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
      {/* 30-Day User Registrations Trend */}
      <div className="lg:col-span-2 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">User Registrations Trend</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Real-time daily incoming customer signups</p>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
            Live Database
          </span>
        </div>

        <div className="h-64 w-full">
          {registrationTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" stroke={textStroke} fontSize={11} tickLine={false} />
                <YAxis stroke={textStroke} fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 3.5 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-zinc-400 dark:text-zinc-500">
              No registration history available yet.
            </div>
          )}
        </div>
      </div>

      {/* User Demographic Roles Breakdown */}
      <div className="rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">User Demographics</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Distribution by profile role</p>
            </div>
          </div>

          <div className="h-52 w-full">
            {roleDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-zinc-700 dark:text-zinc-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400 dark:text-zinc-500">
                No user profiles recorded yet.
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          <span>Active Mobile Users</span>
          <span className="font-semibold text-zinc-900 dark:text-white">
            {roleDistribution.reduce((acc, curr) => acc + curr.count, 0)} Total
          </span>
        </div>
      </div>

      {/* Posts by Category Bar Chart */}
      <div className="lg:col-span-3 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Community Engagement by Category</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Breakdown of user discussions and posts</p>
          </div>
        </div>

        <div className="h-64 w-full">
          {categoryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="category" stroke={textStroke} fontSize={11} tickLine={false} />
                <YAxis stroke={textStroke} fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-zinc-400 dark:text-zinc-500">
              No community posts recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
