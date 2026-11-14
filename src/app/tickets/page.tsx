import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { TicketsTable } from '@/components/tickets/tickets-table'
import { Database } from '@/types/database.types'
import { LifeBuoy } from 'lucide-react'

type TicketRow = Database['public']['Tables']['support_tickets']['Row']

export const dynamic = 'force-dynamic'

export default async function TicketsPage() {
  const { data: rawTickets } = await supabaseAdmin
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false })

  const tickets = (rawTickets || []) as TicketRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Support Ticket Operations</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Review user inquiries, prioritize resolution queues, append internal investigation notes, and manage SLAs.
        </p>
      </div>

      <TicketsTable tickets={tickets} />
    </div>
  )
}
