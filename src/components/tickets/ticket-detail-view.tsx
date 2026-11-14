'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils'
import { updateTicketStatus, updateTicketPriority, addTicketNote } from '@/app/tickets/actions'
import {
  ArrowLeft,
  Mail,
  Send,
  Lock,
} from 'lucide-react'
import Link from 'next/link'

type TicketRow = Database['public']['Tables']['support_tickets']['Row']
type TicketNoteRow = Database['public']['Tables']['ticket_notes']['Row']

interface TicketDetailViewProps {
  ticket: TicketRow
  notes: TicketNoteRow[]
}

export function TicketDetailView({ ticket, notes }: TicketDetailViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [newNote, setNewNote] = useState('')

  const handleStatus = (status: string) => {
    startTransition(async () => {
      await updateTicketStatus(ticket.id, status)
      router.refresh()
    })
  }

  const handlePriority = (priority: string) => {
    startTransition(async () => {
      await updateTicketPriority(ticket.id, priority)
      router.refresh()
    })
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    startTransition(async () => {
      await addTicketNote(ticket.id, 'moderator-system-actor', newNote)
      setNewNote('')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Link
            href="/tickets"
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Ticket #{ticket.ticket_number || ticket.id.slice(0, 8)}
              </h1>
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                {ticket.category}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Submitted on {formatDate(ticket.created_at)}</p>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-2">
          {ticket.status !== 'In Review' && (
            <button
              onClick={() => handleStatus('In Review')}
              disabled={isPending}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 transition-colors cursor-pointer"
            >
              Set In Review
            </button>
          )}
          {ticket.status !== 'Resolved' && (
            <button
              onClick={() => handleStatus('Resolved')}
              disabled={isPending}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-2xs cursor-pointer"
            >
              Mark Resolved
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Ticket Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main User Inquiry */}
          <div className="rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">{ticket.subject}</h2>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>Contact User:</span>
                <a
                  href={`mailto:${ticket.user_email}?subject=Re: Ticket ${ticket.ticket_number || ticket.id.slice(0, 8)} - ${ticket.subject}`}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-mono font-medium"
                >
                  {ticket.user_email || 'No email provided'}
                </a>
              </div>
            </div>
          </div>

          {/* Internal Moderator Notes Section */}
          <div className="rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Internal Moderator Notes</h3>
              </div>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50 font-medium">
                Confidential • Hidden from Mobile Users
              </span>
            </div>

            {/* Existing Notes Feed */}
            <div className="space-y-2.5">
              {notes.length > 0 ? (
                notes.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
                    <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 mb-1">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Moderator Note</span>
                      <span>{formatDate(n.created_at)}</span>
                    </div>
                    <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">{n.note}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/40 text-center text-xs text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-800">
                  No internal notes recorded on this ticket yet.
                </div>
              )}
            </div>

            {/* Add Note Input */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add private investigation note or update on this ticket..."
                className="w-full h-20 p-3 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPending || !newNote.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-2xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Internal Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Meta Details */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-6 shadow-2xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">Ticket Controls</h3>

            <div className="space-y-1.5">
              <label className="text-zinc-700 dark:text-zinc-300 font-medium">Status</label>
              <select
                value={ticket.status}
                onChange={(e) => handleStatus(e.target.value)}
                disabled={isPending}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
              >
                <option value="Open">Open</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-700 dark:text-zinc-300 font-medium">Priority</label>
              <select
                value={ticket.priority}
                onChange={(e) => handlePriority(e.target.value)}
                disabled={isPending}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {ticket.resolved_at && (
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400 block">Resolved At:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {formatDate(ticket.resolved_at)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
