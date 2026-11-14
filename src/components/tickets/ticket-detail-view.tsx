'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils'
import { updateTicketStatus, updateTicketPriority, addTicketNote } from '@/app/tickets/actions'
import {
  ArrowLeft,
  LifeBuoy,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  Send,
  MessageSquare
} from 'lucide-react'

type TicketRow = Database['public']['Tables']['support_tickets']['Row']
type NoteRow = Database['public']['Tables']['ticket_notes']['Row']

interface TicketDetailViewProps {
  ticket: TicketRow
  notes: NoteRow[]
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
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/tickets"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Ticket #{ticket.ticket_number || ticket.id.slice(0, 8)}
              </h1>
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {ticket.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Submitted on {formatDate(ticket.created_at)}</p>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-2">
          {ticket.status !== 'In Review' && (
            <button
              onClick={() => handleStatus('In Review')}
              disabled={isPending}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 transition-colors"
            >
              Set In Review
            </button>
          )}
          {ticket.status !== 'Resolved' && (
            <button
              onClick={() => handleStatus('Resolved')}
              disabled={isPending}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-md shadow-emerald-600/20"
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
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl shadow-black/20 space-y-4">
            <h2 className="text-base font-bold text-white">{ticket.subject}</h2>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Contact User:</span>
                <a
                  href={`mailto:${ticket.user_email}?subject=Re: Ticket ${ticket.ticket_number || ticket.id.slice(0, 8)} - ${ticket.subject}`}
                  className="text-indigo-400 hover:underline font-mono"
                >
                  {ticket.user_email || 'No email provided'}
                </a>
              </div>
            </div>
          </div>

          {/* Internal Moderator Notes Section */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl shadow-black/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Internal Moderator Notes</h3>
              </div>
              <span className="text-[11px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                Confidential • Hidden from Mobile Users
              </span>
            </div>

            {/* Existing Notes Feed */}
            <div className="space-y-2.5">
              {notes.length > 0 ? (
                notes.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="font-semibold text-slate-300">Moderator Note</span>
                      <span>{formatDate(n.created_at)}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{n.note}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/40 text-center text-xs text-slate-500">
                  No internal notes recorded on this ticket yet.
                </div>
              )}
            </div>

            {/* Add Note Input */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-800">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add private investigation note or update on this ticket..."
                className="w-full h-20 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#5B6FD0]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPending || !newNote.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md shadow-indigo-600/20"
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
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl shadow-black/20 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white mb-2">Ticket Controls</h3>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">Status</label>
              <select
                value={ticket.status}
                onChange={(e) => handleStatus(e.target.value)}
                disabled={isPending}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold focus:outline-none focus:border-[#5B6FD0]"
              >
                <option value="Open">Open</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">Priority</label>
              <select
                value={ticket.priority}
                onChange={(e) => handlePriority(e.target.value)}
                disabled={isPending}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold focus:outline-none focus:border-[#5B6FD0]"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {ticket.resolved_at && (
              <div className="pt-3 border-t border-slate-800">
                <span className="text-slate-500 block">Resolved At:</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">
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
