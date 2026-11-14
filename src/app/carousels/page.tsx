import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CarouselManager } from '@/components/carousels/carousel-manager'
import { Database } from '@/types/database.types'
import { Image as ImageIcon, Info } from 'lucide-react'

type EventRow = Database['public']['Tables']['events']['Row']
type CardRow = Database['public']['Tables']['explore_cards']['Row']
type BannerRow = Database['public']['Tables']['app_banners']['Row']

export const dynamic = 'force-dynamic'

export default async function CarouselsPage() {
  const { data: rawEvents } = await supabaseAdmin
    .from('events')
    .select('*')
  const events = (rawEvents || []) as EventRow[]

  const { data: rawCards, error: cardsError } = await supabaseAdmin
    .from('explore_cards')
    .select('*')
  const exploreCards = (rawCards || []) as CardRow[]

  const { data: rawBanners, error: bannersError } = await supabaseAdmin
    .from('app_banners')
    .select('*')
  const appBanners = (rawBanners || []) as BannerRow[]

  const isBannersMissing = Boolean(bannersError || cardsError)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Carousel & Visual Banner Control</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage featured home hero banners, explore cards, and splash onboarding assets with real-time mobile frame emulation.
        </p>
      </div>

      {isBannersMissing && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold">Notice:</span> Dedicated splash and onboarding card tables (`app_banners`, `explore_cards`) have not been migrated yet. Hero carousels driven by events remain fully functional. Run <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 font-mono text-[11px]">database_migration_master.sql</code> to activate banner assets.
          </div>
        </div>
      )}

      <CarouselManager
        events={events}
        exploreCards={exploreCards}
        appBanners={appBanners}
      />
    </div>
  )
}
