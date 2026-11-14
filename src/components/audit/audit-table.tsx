'use client'

import React, { useState, useMemo } from 'react'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils'
import {
  Search,
  ChevronDown,
  ChevronUp,
  Activity
} from 'lucide-react'

type AuditRow = Database['public']['Tables']['moderator_audit_log']['Row']

interface AuditTableProps {
  logs: AuditRow[]
}

export function AuditTable({ logs }: AuditTableProps) {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('All')
  const [tableFilter, setTableFilter] = useState('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        search === '' ||
        l.table_name.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        (l.record_id || '').toLowerCase().includes(search.toLowerCase())

      const matchAction = actionFilter === 'All' || l.action === actionFilter
      const matchTable = tableFilter === 'All' || l.table_name === tableFilter

      return matchSearch && matchAction && matchTable
    })
  }, [logs, search, actionFilter, tableFilter])

  return (
    <div className="space-y-4">
      {/* Search Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-4 rounded-2xl shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by table name, action, or record ID..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            <option value="All">All Actions</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>

          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            <option value="All">All Tables</option>
            <option value="properties">properties</option>
            <option value="events">events</option>
            <option value="food_spots">food_spots</option>
            <option value="community_posts">community_posts</option>
            <option value="support_tickets">support_tickets</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Target Entity</th>
                <th className="px-6 py-3.5">Record ID</th>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5 text-right">JSON Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {filtered.length > 0 ? (
                filtered.map((l) => {
                  const isExpanded = expandedId === l.id
                  return (
                    <React.Fragment key={l.id}>
                      <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${
                              l.action === 'INSERT'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                                : l.action === 'UPDATE'
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
                            }`}
                          >
                            {l.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-zinc-900 dark:text-white font-medium">
                          {l.table_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-zinc-500 dark:text-zinc-400">
                          {l.record_id ? l.record_id.slice(0, 12) + '...' : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
                          {formatDate(l.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : l.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide Diff' : 'View Diff'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>

                      {/* JSON Snapshot Viewer Accordion */}
                      {isExpanded && (
                        <tr className="bg-zinc-50/90 dark:bg-zinc-900/60">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                              <div className="p-3 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800">
                                <span className="text-zinc-500 font-bold block mb-1">
                                  PREVIOUS SNAPSHOT (OLD)
                                </span>
                                <pre className="text-rose-600 dark:text-rose-400 whitespace-pre-wrap overflow-x-auto max-h-40">
                                  {l.old_value ? JSON.stringify(l.old_value, null, 2) : 'null (New Record)'}
                                </pre>
                              </div>
                              <div className="p-3 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800">
                                <span className="text-zinc-500 font-bold block mb-1">
                                  NEW SNAPSHOT (UPDATED)
                                </span>
                                <pre className="text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap overflow-x-auto max-h-40">
                                  {l.new_value ? JSON.stringify(l.new_value, null, 2) : 'null (Deleted)'}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-sm text-zinc-400 dark:text-zinc-500">
                    <Activity className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                    <div>No audit log events recorded yet. All database mutations will automatically stream here.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
