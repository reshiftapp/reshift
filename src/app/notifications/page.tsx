import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NotificationsManager } from '@/components/notifications/notifications-manager'
import { Database } from '@/types/database.types'
import { Bell } from 'lucide-react'

type NotificationRow = Database['public']['Tables']['push_notifications']['Row']

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  let history: NotificationRow[] = []

  try {
    const { data: rawHistory, error } = await supabaseAdmin
      .from('push_notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && rawHistory) {
      history = rawHistory as NotificationRow[]
    }
  } catch (err) {
    console.warn('Notifications query fallback:', err)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Push Notification Broadcasting</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Compose targeted public alerts, event reminders, and new housing alerts broadcasted directly to mobile devices.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Broadcasting Engine Ready</span>
        </div>
      </div>

      <NotificationsManager history={history} />
    </div>
  )
}
