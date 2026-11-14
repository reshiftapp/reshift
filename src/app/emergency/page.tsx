import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { EmergencyManager } from '@/components/emergency/emergency-manager'
import { Database } from '@/types/database.types'
import { AlertTriangle } from 'lucide-react'

type EmergencyRow = Database['public']['Tables']['emergency_services']['Row']

export const dynamic = 'force-dynamic'

export default async function EmergencyPage() {
  const { data: rawServices } = await supabaseAdmin.from('emergency_services').select('*')
  const services = (rawServices || []) as EmergencyRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <span>Emergency Services & SOS Control</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Instant updates to critical helplines, police control rooms, ambulances, and emergency hospital numbers shown in the app.
        </p>
      </div>

      <EmergencyManager services={services} />
    </div>
  )
}
