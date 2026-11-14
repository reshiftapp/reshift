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
  let events: EventRow[] = []
  let exploreCards: CardRow[] = []
  let appBanners: BannerRow[] = []

  try {
    const { data: rawEvents } = await supabaseAdmin.from('events').select('*')
    events = (rawEvents || []) as EventRow[]
  } catch (e) {
    console.warn('Events query fallback:', e)
  }

  try {
    const { data: rawCards } = await supabaseAdmin.from('explore_cards').select('*')
    exploreCards = (rawCards || []) as CardRow[]
  } catch (e) {
    console.warn('Cards query fallback:', e)
  }

  try {
    const { data: rawBanners } = await supabaseAdmin.from('app_banners').select('*')
    appBanners = (rawBanners || []) as BannerRow[]
  } catch (e) {
    console.warn('Banners query fallback:', e)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Carousel & Visual Banner Control</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage featured home hero banners, explore cards, and splash onboarding assets with real-time mobile frame emulation.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Simulator Live</span>
        </div>
      </div>

      <CarouselManager
        events={events}
        exploreCards={exploreCards}
        appBanners={appBanners}
      />
    </div>
  )
}
