import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { SettingsManager } from '@/components/settings/settings-manager'
import { Database } from '@/types/database.types'
import { Settings } from 'lucide-react'

type StepRow = Database['public']['Tables']['relocation_steps']['Row']

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const { data: rawSteps } = await supabaseAdmin
    .from('relocation_steps')
    .select('*')
    .order('sort_order', { ascending: true })

  const steps = (rawSteps || []) as StepRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[#5B6FD0]" />
          <span>App Configurations & Checklist Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize the 5-step relocation checklist, review supported city coordinates, and control global mobile parameters.
        </p>
      </div>

      <SettingsManager steps={steps} />
    </div>
  )
}
