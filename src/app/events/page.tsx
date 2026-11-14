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
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Events & Hero Carousel Management</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Schedule local meetups, music and cultural events, and curate the featured carousel banners displayed on the mobile app home screen.
        </p>
      </div>

      <EventsManager events={events} />
    </div>
  )
}
