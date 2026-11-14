import React from 'react'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { TicketDetailView } from '@/components/tickets/ticket-detail-view'
import { Database } from '@/types/database.types'

type TicketRow = Database['public']['Tables']['support_tickets']['Row']
type NoteRow = Database['public']['Tables']['ticket_notes']['Row']

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TicketDetailPage({ params }: Props) {
  const { id } = await params

  const { data: rawTicket } = await supabaseAdmin
    .from('support_tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (!rawTicket) {
    notFound()
  }

  const ticket = rawTicket as TicketRow

  // Fetch internal notes
  const { data: rawNotes } = await supabaseAdmin
    .from('ticket_notes')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true })

  const notes = (rawNotes || []) as NoteRow[]

  return <TicketDetailView ticket={ticket} notes={notes} />
}
