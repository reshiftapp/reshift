'use client'

import React from 'react'
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

const COLORS = ['#5B6FD0', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export function OverviewCharts({
  registrationTrends,
  categoryDistribution,
  roleDistribution,
}: OverviewChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* 30-Day User Registrations Trend */}
      <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-base font-semibold text-white">User Registrations Trend</h4>
            <p className="text-xs text-slate-400 mt-0.5">Real-time daily incoming user signups</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Live Database
          </span>
        </div>

        <div className="h-64 w-full">
          {registrationTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#5B6FD0"
                  strokeWidth={2.5}
                  dot={{ fill: '#5B6FD0', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No registration history available yet.
            </div>
          )}
        </div>
      </div>

      {/* User Demographic Roles Breakdown */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-lg shadow-black/20 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-semibold text-white">User Demographics</h4>
              <p className="text-xs text-slate-400 mt-0.5">Distribution by profile role</p>
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No user profiles recorded yet.
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Active Mobile Users</span>
          <span className="font-semibold text-white">
            {roleDistribution.reduce((acc, curr) => acc + curr.count, 0)} Total
          </span>
        </div>
      </div>

      {/* Posts by Category Bar Chart */}
      <div className="lg:col-span-3 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-base font-semibold text-white">Community Engagement by Category</h4>
            <p className="text-xs text-slate-400 mt-0.5">Breakdown of user discussions and posts</p>
          </div>
        </div>

        <div className="h-64 w-full">
          {categoryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#5B6FD0" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No community posts recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
