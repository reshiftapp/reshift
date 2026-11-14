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
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Wifi className="w-6 h-6 text-[#5B6FD0]" />
          <span>Internet & SIM Plans Management</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure broadband options, speed tiers, monthly pricing, and provider helpline contact numbers for relocated users.
        </p>
      </div>

      <InternetManager plans={plans} />
    </div>
  )
}
