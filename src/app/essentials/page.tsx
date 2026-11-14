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
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Essentials & Utilities Management</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Catalog local supermarkets, pharmacies, electronics repair, SIM and home utility stores.
        </p>
      </div>

      <EssentialsManager places={places} />
    </div>
  )
}
