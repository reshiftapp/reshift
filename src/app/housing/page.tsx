import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { HousingTable } from '@/components/housing/housing-table'
import { Database } from '@/types/database.types'
import { Home } from 'lucide-react'

type PropertyRow = Database['public']['Tables']['properties']['Row']

export const dynamic = 'force-dynamic'

export default async function HousingPage() {
  const { data: rawProperties } = await supabaseAdmin
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  const properties = (rawProperties || []) as PropertyRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Home className="w-6 h-6 text-[#5B6FD0]" />
          <span>Housing & PG Management</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Catalog management, tenant segregation, rent pricing, verified flags, and bulk CSV operations for {properties.length} listed properties.
        </p>
      </div>

      {/* Interactive Data Table */}
      <HousingTable properties={properties} />
    </div>
  )
}
