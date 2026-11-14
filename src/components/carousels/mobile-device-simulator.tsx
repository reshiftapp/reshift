'use client'

import React, { useState, useEffect } from 'react'
import { Database } from '@/types/database.types'
import { Sparkles, MapPin, ChevronLeft, ChevronRight, Wifi, Battery, Signal } from 'lucide-react'

type EventRow = Database['public']['Tables']['events']['Row']
type CardRow = Database['public']['Tables']['explore_cards']['Row']

interface MobileDeviceSimulatorProps {
  featuredEvents: EventRow[]
  exploreCards: CardRow[]
  city: string
}

export function MobileDeviceSimulator({
  featuredEvents,
  exploreCards,
  city,
}: MobileDeviceSimulatorProps) {
  const [activeSlide, setActiveSlide] = useState(0)

  // Auto-rotate hero banner every 4 seconds
  useEffect(() => {
    if (featuredEvents.length <= 1) return
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % featuredEvents.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [featuredEvents.length])

  return (
    <div className="w-[320px] rounded-[44px] bg-slate-900 border-[8px] border-slate-800 p-3 shadow-2xl shadow-black/80 flex flex-col justify-between select-none">
      {/* Smartphone Notch / Dynamic Island */}
      <div className="relative pt-2 pb-1 px-4 flex items-center justify-between text-[11px] font-semibold text-slate-300">
        <span>09:41</span>
        <div className="w-20 h-4 rounded-full bg-black mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
        <div className="flex items-center gap-1.5 text-slate-400">
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <Battery className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      {/* Screen Viewport */}
      <div className="mt-2 rounded-[28px] bg-slate-950 overflow-hidden border border-slate-800/80 h-[580px] flex flex-col">
        {/* Mobile App Header */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#5B6FD0] to-indigo-400 flex items-center justify-center text-white font-bold text-xs shadow-md">
              R
            </div>
            <div>
              <div className="text-[10px] text-slate-400 leading-none">Exploring in</div>
              <div className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#5B6FD0]" />
                <span>{city}</span>
              </div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
            JD
          </div>
        </div>

        {/* Scrollable Feed Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Section 1: Hero Featured Carousel */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[11px] font-bold text-white flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" /> Live in {city}
              </span>
              <span className="text-[9px] text-[#5B6FD0] font-semibold">Featured</span>
            </div>

            {featuredEvents.length > 0 ? (
              <div className="relative rounded-2xl overflow-hidden h-36 bg-slate-900 border border-slate-800 shadow-md">
                {featuredEvents[activeSlide]?.image_url ? (
                  <img
                    src={featuredEvents[activeSlide].image_url!}
                    alt=""
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-950 to-slate-900 flex items-center justify-center p-3 text-center text-xs text-slate-400">
                    {featuredEvents[activeSlide]?.title}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-3">
                  <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-[#5B6FD0] text-white w-fit uppercase">
                    {featuredEvents[activeSlide]?.category}
                  </span>
                  <div className="text-xs font-bold text-white line-clamp-1 mt-1">
                    {featuredEvents[activeSlide]?.title}
                  </div>
                  <div className="text-[10px] text-slate-300 line-clamp-1">
                    {featuredEvents[activeSlide]?.venue}
                  </div>
                </div>

                {/* Carousel Pagination Dots */}
                {featuredEvents.length > 1 && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    {featuredEvents.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          activeSlide === idx ? 'w-3 bg-white' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-center text-[10px] text-slate-500">
                No events currently marked as Featured in {city}.
              </div>
            )}
          </div>

          {/* Section 2: Explore Cards Horizontal Scroll */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[11px] font-bold text-white">Explore Highlights</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {exploreCards.length > 0 ? (
                exploreCards.map((c) => (
                  <div
                    key={c.id}
                    className="min-w-[120px] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0"
                  >
                    <div className="h-16 bg-slate-800">
                      {c.image_url && (
                        <img src={c.image_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-2">
                      <div className="text-[10px] font-bold text-white truncate">{c.title}</div>
                      <div className="text-[8px] text-slate-400 truncate">{c.subtitle}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full py-4 text-center text-[10px] text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No explore cards active
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile App Bottom Tab Bar */}
        <div className="h-12 bg-slate-900/90 border-t border-slate-800 flex items-center justify-around text-[10px] text-slate-400">
          <span className="text-[#5B6FD0] font-bold">Home</span>
          <span>Housing</span>
          <span>Explore</span>
          <span>Community</span>
        </div>
      </div>

      {/* Home Indicator Bar */}
      <div className="w-28 h-1 rounded-full bg-slate-700 mx-auto mt-2" />
    </div>
  )
}
