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
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-3.5 rounded-xl shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket #, user email, or subject..."
            className="w-full pl-8.5 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
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
            className="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Ticket #</th>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Subject & Category</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/60">
              {filtered.length > 0 ? (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors group">
                    {/* Ticket Number */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono font-semibold text-zinc-900 dark:text-white">
                      <Link href={`/tickets/${t.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        #{t.ticket_number || t.id.slice(0, 8)}
                      </Link>
                    </td>

                    {/* User Email */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{t.user_email || 'Anonymous'}</span>
                      </div>
                    </td>

                    {/* Subject & Category */}
                    <td className="px-5 py-3.5">
                      <div>
                        <Link
                          href={`/tickets/${t.id}`}
                          className="font-medium text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1"
                        >
                          {t.subject}
                        </Link>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
                          {t.category}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                          t.priority === 'High'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40'
                            : t.priority === 'Medium'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40'
                            : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/60'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    {/* Status with Quick Transition Selector */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <select
                        value={t.status}
                        onChange={(e) => handleQuickStatusChange(t.id, e.target.value)}
                        disabled={isPending}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium border focus:outline-none ${
                          t.status === 'Open'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : t.status === 'In Review'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        <option value="Open">Open</option>
                        <option value="In Review">In Review</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      {formatDate(t.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <Link
                        href={`/tickets/${t.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/60 mb-2" />
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
