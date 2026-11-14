import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { InternetManager } from '@/components/internet/internet-manager'
import { Database } from '@/types/database.types'
import { Wifi } from 'lucide-react'

type PlanRow = Database['public']['Tables']['internet_plans']['Row']

export const dynamic = 'force-dynamic'

export default async function InternetPage() {
  const { data: rawPlans } = await supabaseAdmin.from('internet_plans').select('*')
  const plans = (rawPlans || []) as PlanRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <Wifi className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Internet & SIM Plans Management</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Configure broadband options, speed tiers, monthly pricing, and provider helpline contact numbers for relocated users.
        </p>
      </div>

      <InternetManager plans={plans} />
    </div>
  )
}
