import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { FoodManager } from '@/components/food/food-manager'
import { Database } from '@/types/database.types'
import { UtensilsCrossed } from 'lucide-react'

type FoodSpotRow = Database['public']['Tables']['food_spots']['Row']

export const dynamic = 'force-dynamic'

export default async function FoodPage() {
  const { data: rawFoodSpots } = await supabaseAdmin
    .from('food_spots')
    .select('*')

  const foodSpots = (rawFoodSpots || []) as FoodSpotRow[]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <UtensilsCrossed className="w-6 h-6 text-[#5B6FD0]" />
          <span>Food & Places Management</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Catalog local cuisine spots, popular restaurants, budget eateries, and manage real-time availability states.
        </p>
      </div>

      <FoodManager foodSpots={foodSpots} />
    </div>
  )
}
