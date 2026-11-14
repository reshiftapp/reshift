'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { MobileDeviceSimulator } from '@/components/carousels/mobile-device-simulator'
import { ImageUploader } from '@/components/shared/image-uploader'
import { createExploreCard, deleteExploreCard, createAppBanner, deleteAppBanner } from '@/app/carousels/actions'
import { toggleEventFeatured } from '@/app/events/actions'
import {
  Sparkles,
  Plus,
  Trash2,
  X,
  Smartphone,
  Eye,
  Layers,
  MapPin
} from 'lucide-react'

type EventRow = Database['public']['Tables']['events']['Row']
type CardRow = Database['public']['Tables']['explore_cards']['Row']
type BannerRow = Database['public']['Tables']['app_banners']['Row']

interface CarouselManagerProps {
  events: EventRow[]
  exploreCards: CardRow[]
  appBanners: BannerRow[]
}

export function CarouselManager({
  events,
  exploreCards,
  appBanners,
}: CarouselManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedCity, setSelectedCity] = useState('Kochi')

  // Modals
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [cardTitle, setCardTitle] = useState('')
  const [cardSubtitle, setCardSubtitle] = useState('')
  const [cardImage, setCardImage] = useState('')

  const [bannerModalOpen, setBannerModalOpen] = useState(false)
  const [bannerPlacement, setBannerPlacement] = useState('splash')
  const [bannerImage, setBannerImage] = useState('')

  const featuredEvents = events.filter((e) => e.is_featured && (selectedCity === 'All' || e.city === selectedCity))
  const cityExploreCards = exploreCards.filter((c) => selectedCity === 'All' || c.city === selectedCity)

  const handleCreateExploreCard = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await createExploreCard({
        title: cardTitle,
        subtitle: cardSubtitle,
        city: selectedCity,
        image_url: cardImage || null,
        is_active: true,
        sort_order: 1,
      })
      setCardModalOpen(false)
      setCardTitle('')
      setCardSubtitle('')
      setCardImage('')
      router.refresh()
    })
  }

  const handleDeleteExploreCard = (id: string) => {
    startTransition(async () => {
      await deleteExploreCard(id)
      router.refresh()
    })
  }

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await createAppBanner({
        placement: bannerPlacement,
        image_url: bannerImage,
        is_active: true,
        sort_order: 1,
      })
      setBannerModalOpen(false)
      setBannerImage('')
      router.refresh()
    })
  }

  const handleDeleteBanner = (id: string) => {
    startTransition(async () => {
      await deleteAppBanner(id)
      router.refresh()
    })
  }

  const handleUnfeatureEvent = (id: string) => {
    startTransition(async () => {
      await toggleEventFeatured(id, false)
      router.refresh()
    })
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Left 2 Columns: Carousel Controls */}
      <div className="xl:col-span-2 space-y-6">
        {/* City Filter */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <MapPin className="w-4 h-4 text-[#5B6FD0]" />
            <span>Select Preview City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#5B6FD0]"
            >
              <option value="Kochi">Kochi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Trivandrum">Trivandrum</option>
              <option value="Calicut">Calicut</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {featuredEvents.length} Featured Events Active
          </span>
        </div>

        {/* SECTION 1: Featured Events Hero Carousel */}
        <div className="rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Home Hero Carousel: Featured Events ({selectedCity})</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                These banners are displayed at the top of the mobile home screen.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {featuredEvents.length > 0 ? (
              featuredEvents.map((e) => (
                <div
                  key={e.id}
                  className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {e.image_url ? (
                      <img src={e.image_url} alt="" className="w-16 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600 text-[10px]">
                        No image
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">{e.title}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{e.venue} • {e.city}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnfeatureEvent(e.id)}
                    disabled={isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                  >
                    Remove from Hero
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
                No events currently marked as featured in {selectedCity}. Head to the Events section to promote an event!
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Explore Highlights Cards */}
        <div className="rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5B6FD0]" />
                <span>Explore Highlight Cards</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Curated card recommendations displayed on the mobile Explore screen.
              </p>
            </div>
            <button
              onClick={() => setCardModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 text-white shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Card</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {cityExploreCards.length > 0 ? (
              cityExploreCards.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between"
                >
                  <div className="h-24 bg-zinc-200 dark:bg-zinc-800">
                    {c.image_url && (
                      <img src={c.image_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-3 flex items-start justify-between">
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-white text-xs">{c.title}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{c.subtitle}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteExploreCard(c.id)}
                      disabled={isPending}
                      className="p-1 rounded text-rose-500 hover:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
                No explore cards created yet.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: Splash & Onboarding Banners */}
        <div className="rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">App Onboarding & Splash Banners</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Banners displayed during mobile onboarding flow.
              </p>
            </div>
            <button
              onClick={() => setBannerModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 text-white shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Banner</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {appBanners.length > 0 ? (
              appBanners.map((b) => (
                <div key={b.id} className="rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="h-28 bg-zinc-200 dark:bg-zinc-800">
                    <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      {b.placement}
                    </span>
                    <button
                      onClick={() => handleDeleteBanner(b.id)}
                      disabled={isPending}
                      className="text-rose-500 hover:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 p-1 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-6 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
                No onboarding banners uploaded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Mobile Frame Live Simulator */}
      <div className="flex flex-col items-center">
        <div className="sticky top-20 flex flex-col items-center space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white">
            <Smartphone className="w-4 h-4 text-[#5B6FD0]" />
            <span>Mobile Live View Emulation</span>
          </div>
          <MobileDeviceSimulator
            featuredEvents={featuredEvents}
            exploreCards={cityExploreCards}
            city={selectedCity}
          />
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center max-w-[280px]">
            Real-time emulation reflecting exact images and order seen on iOS & Android devices.
          </p>
        </div>
      </div>

      {/* Explore Card Modal */}
      {cardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Add Explore Card</h3>
              <button onClick={() => setCardModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExploreCard} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Title *</label>
                <input
                  type="text"
                  required
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  placeholder="e.g. Best Cafés & Workspots"
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#5B6FD0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Subtitle</label>
                <input
                  type="text"
                  value={cardSubtitle}
                  onChange={(e) => setCardSubtitle(e.target.value)}
                  placeholder="e.g. Curated recommendations"
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#5B6FD0]"
                />
              </div>

              <div className="space-y-1.5">
                <ImageUploader
                  bucket="carousel-images"
                  currentUrl={cardImage}
                  onUploadComplete={(url) => setCardImage(url)}
                  label="Card Cover Photo"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCardModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 text-white shadow-sm"
                >
                  {isPending ? 'Saving...' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Add App Banner</h3>
              <button onClick={() => setBannerModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Placement</label>
                <select
                  value={bannerPlacement}
                  onChange={(e) => setBannerPlacement(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#5B6FD0]"
                >
                  <option value="splash">Splash Screen</option>
                  <option value="onboarding_1">Onboarding 1 (Welcome)</option>
                  <option value="onboarding_2">Onboarding 2 (Find Home)</option>
                  <option value="onboarding_3">Onboarding 3 (Community)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <ImageUploader
                  bucket="carousel-images"
                  currentUrl={bannerImage}
                  onUploadComplete={(url) => setBannerImage(url)}
                  label="Banner Graphic"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !bannerImage}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 disabled:opacity-50 text-white shadow-sm"
                >
                  {isPending ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
