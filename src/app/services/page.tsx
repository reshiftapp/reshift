import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { EssentialsManager } from '@/components/essentials/essentials-manager'
import { Database } from '@/types/database.types'
import { Building2 } from 'lucide-react'

type PlaceRow = Database['public']['Tables']['essential_places']['Row']

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
  const { data: rawPlaces } = await supabaseAdmin
    .from('essential_places')
    .select('*')
    .in('category', ['Banking', 'Pharmacy', 'Medical'])

  const places = (rawPlaces || []) as PlaceRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Bank & Medical Facilities</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Direct directory for banks, ATMs, 24/7 pharmacies, clinics, and medical centers.
        </p>
      </div>

      <EssentialsManager
        places={places}
        title="Bank & Medical Facilities"
      />
    </div>
  )
}
