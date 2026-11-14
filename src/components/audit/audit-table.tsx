'use client'

import React, { useState, useMemo } from 'react'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils'
import {
  ShieldCheck,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Layers,
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
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg shadow-black/20">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by table name, action, or record ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5B6FD0]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#5B6FD0]"
          >
            <option value="All">All Actions</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>

          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#5B6FD0]"
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
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Target Entity</th>
                <th className="px-6 py-3.5">Record ID</th>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5 text-right">JSON Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length > 0 ? (
                filtered.map((l) => {
                  const isExpanded = expandedId === l.id
                  return (
                    <React.Fragment key={l.id}>
                      <tr className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${
                              l.action === 'INSERT'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : l.action === 'UPDATE'
                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {l.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-white">
                          {l.table_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-400">
                          {l.record_id ? l.record_id.slice(0, 12) + '...' : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                          {formatDate(l.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : l.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          >
                            <span>{isExpanded ? 'Hide Diff' : 'View Diff'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>

                      {/* JSON Snapshot Viewer Accordion */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="text-slate-500 font-bold block mb-1">
                                  PREVIOUS SNAPSHOT (OLD)
                                </span>
                                <pre className="text-rose-400 whitespace-pre-wrap overflow-x-auto max-h-40">
                                  {l.old_value ? JSON.stringify(l.old_value, null, 2) : 'null (New Record)'}
                                </pre>
                              </div>
                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="text-slate-500 font-bold block mb-1">
                                  NEW SNAPSHOT (UPDATED)
                                </span>
                                <pre className="text-emerald-400 whitespace-pre-wrap overflow-x-auto max-h-40">
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
                  <td colSpan={5} className="px-6 py-16 text-center text-sm text-slate-500">
                    <Activity className="w-10 h-10 mx-auto text-slate-700 mb-2" />
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
