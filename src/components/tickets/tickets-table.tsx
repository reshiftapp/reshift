'use client'

import React, { useState, useTransition, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils'
import { updateTicketStatus } from '@/app/tickets/actions'
import {
  LifeBuoy,
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  Mail,
  User,
  ExternalLink
} from 'lucide-react'

type TicketRow = Database['public']['Tables']['support_tickets']['Row']

interface TicketsTableProps {
  tickets: TicketRow[]
}

export function TicketsTable({ tickets }: TicketsTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        search === '' ||
        (t.ticket_number || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.user_email || '').toLowerCase().includes(search.toLowerCase()) ||
        t.subject.toLowerCase().includes(search.toLowerCase())

      const matchStatus = statusFilter === 'All' || t.status === statusFilter
      const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter

      return matchSearch && matchStatus && matchPriority
    })
  }, [tickets, search, statusFilter, priorityFilter])

  const handleQuickStatusChange = (id: string, newStatus: string) => {
    startTransition(async () => {
      await updateTicketStatus(id, newStatus)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg shadow-black/20">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket #, user email, or subject..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5B6FD0]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#5B6FD0]"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#5B6FD0]"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Ticket #</th>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Subject & Category</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Submitted</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length > 0 ? (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Ticket Number */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-white">
                      <Link href={`/tickets/${t.id}`} className="hover:text-indigo-400 transition-colors">
                        #{t.ticket_number || t.id.slice(0, 8)}
                      </Link>
                    </td>

                    {/* User Email */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t.user_email || 'Anonymous'}</span>
                      </div>
                    </td>

                    {/* Subject & Category */}
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          href={`/tickets/${t.id}`}
                          className="font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-1"
                        >
                          {t.subject}
                        </Link>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          {t.category}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          t.priority === 'High'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : t.priority === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    {/* Status with Quick Transition Selector */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <select
                        value={t.status}
                        onChange={(e) => handleQuickStatusChange(t.id, e.target.value)}
                        disabled={isPending}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border focus:outline-none ${
                          t.status === 'Open'
                            ? 'bg-rose-950/40 text-rose-300 border-rose-800'
                            : t.status === 'In Review'
                            ? 'bg-amber-950/40 text-amber-300 border-amber-800'
                            : 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        <option value="Open">Open</option>
                        <option value="In Review">In Review</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                      {formatDate(t.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <Link
                        href={`/tickets/${t.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-[#5B6FD0] font-medium border border-indigo-500/20 transition-colors"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-slate-500">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/40 mb-2" />
                    <div>All clear! No support tickets matching your filters.</div>
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
