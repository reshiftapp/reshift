import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NotificationsManager } from '@/components/notifications/notifications-manager'
import { Database } from '@/types/database.types'
import { Bell, Info } from 'lucide-react'

type NotificationRow = Database['public']['Tables']['push_notifications']['Row']

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const { data: rawHistory, error } = await supabaseAdmin
    .from('push_notifications')
    .select('*')
    .order('created_at', { ascending: false })

  const history = (rawHistory || []) as NotificationRow[]
  const isTableMissing = Boolean(error && error.message.includes('push_notifications'))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Push Notification Broadcasting</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Compose targeted public alerts, event reminders, and new housing alerts broadcasted directly to mobile devices.
        </p>
      </div>

      {isTableMissing && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold">Notice for Super Admin:</span> The push notification audit table (`push_notifications`) has not yet been initialized in your Supabase project. Broadcast logs will not persist until you execute the SQL script in <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 font-mono text-[11px]">database_migration_master.sql</code> via the Supabase SQL Editor.
          </div>
        </div>
      )}

      <NotificationsManager history={history} />
    </div>
  )
}
