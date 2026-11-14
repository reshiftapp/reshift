import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CarouselManager } from '@/components/carousels/carousel-manager'
import { Database } from '@/types/database.types'
import { Image as ImageIcon } from 'lucide-react'

type EventRow = Database['public']['Tables']['events']['Row']
type CardRow = Database['public']['Tables']['explore_cards']['Row']
type BannerRow = Database['public']['Tables']['app_banners']['Row']

export const dynamic = 'force-dynamic'

export default async function CarouselsPage() {
  const { data: rawEvents } = await supabaseAdmin
    .from('events')
    .select('*')
    .order('sort_order', { ascending: true })
  const events = (rawEvents || []) as EventRow[]

  const { data: rawCards } = await supabaseAdmin
    .from('explore_cards')
    .select('*')
    .order('sort_order', { ascending: true })
  const exploreCards = (rawCards || []) as CardRow[]

  const { data: rawBanners } = await supabaseAdmin
    .from('app_banners')
    .select('*')
    .order('sort_order', { ascending: true })
  const appBanners = (rawBanners || []) as BannerRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <ImageIcon className="w-6 h-6 text-[#5B6FD0]" />
          <span>Carousel & Visual Banner Control</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage featured home hero banners, explore cards, and splash onboarding assets with real-time mobile frame emulation.
        </p>
      </div>

      <CarouselManager
        events={events}
        exploreCards={exploreCards}
        appBanners={appBanners}
      />
    </div>
  )
}
