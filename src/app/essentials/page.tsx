import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { EssentialsManager } from '@/components/essentials/essentials-manager'
import { Database } from '@/types/database.types'
import { ShoppingBag } from 'lucide-react'

type PlaceRow = Database['public']['Tables']['essential_places']['Row']

export const dynamic = 'force-dynamic'

export default async function EssentialsPage() {
  const { data: rawPlaces } = await supabaseAdmin.from('essential_places').select('*')
  const places = (rawPlaces || []) as PlaceRow[]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <ShoppingBag className="w-6 h-6 text-[#5B6FD0]" />
          <span>Essentials & Utilities Management</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Catalog local supermarkets, pharmacies, electronics repair, SIM and home utility stores.
        </p>
      </div>

      <EssentialsManager places={places} />
    </div>
  )
}
