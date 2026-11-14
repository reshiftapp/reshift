import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NotificationsManager } from '@/components/notifications/notifications-manager'
import { Database } from '@/types/database.types'
import { Bell } from 'lucide-react'

type NotificationRow = Database['public']['Tables']['push_notifications']['Row']

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const { data: rawHistory } = await supabaseAdmin
    .from('push_notifications')
    .select('*')
    .order('created_at', { ascending: false })

  const history = (rawHistory || []) as NotificationRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Bell className="w-6 h-6 text-[#5B6FD0]" />
          <span>Push Notification Broadcasting</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Compose targeted public alerts, event reminders, and new housing alerts broadcasted directly to mobile devices.
        </p>
      </div>

      <NotificationsManager history={history} />
    </div>
  )
}
