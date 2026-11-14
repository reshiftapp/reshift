import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { EventsManager } from '@/components/events/events-manager'
import { Database } from '@/types/database.types'
import { Calendar } from 'lucide-react'

type EventRow = Database['public']['Tables']['events']['Row']

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const { data: rawEvents } = await supabaseAdmin
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })

  const events = (rawEvents || []) as EventRow[]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Calendar className="w-6 h-6 text-[#5B6FD0]" />
          <span>Events & Hero Carousel Management</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Schedule local meetups, music and cultural events, and curate the featured carousel banners displayed on the mobile app home screen.
        </p>
      </div>

      <EventsManager events={events} />
    </div>
  )
}
