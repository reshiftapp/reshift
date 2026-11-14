'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils'
import { ImageUploader } from '@/components/shared/image-uploader'
import {
  createEvent,
  updateEvent,
  toggleEventFeatured,
  toggleEventActive,
  deleteEvent,
} from '@/app/events/actions'
import {
  Calendar,
  Plus,
  Search,
  Star,
  MapPin,
  Clock,
  Trash2,
  Edit,
  Sparkles,
  X,
  Save,
  CheckCircle2
} from 'lucide-react'

type EventRow = Database['public']['Tables']['events']['Row']

interface EventsManagerProps {
  events: EventRow[]
}

const CATEGORIES = ['Community', 'Music', 'Sports', 'Tech', 'Culture', 'Food']

export function EventsManager({ events }: EventsManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [featuredFilter, setFeaturedFilter] = useState('All')

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null)

  // Form Fields
  const [title, setTitle] = useState('')
  const [city, setCity] = useState('Kochi')
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 16))
  const [venue, setVenue] = useState('')
  const [category, setCategory] = useState('Community')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        search === '' ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.venue.toLowerCase().includes(search.toLowerCase())

      const matchCity = cityFilter === 'All' || e.city === cityFilter
      const matchCat = categoryFilter === 'All' || e.category === categoryFilter
      const matchFeatured =
        featuredFilter === 'All' ||
        (featuredFilter === 'Featured' && e.is_featured) ||
        (featuredFilter === 'Standard' && !e.is_featured)

      return matchSearch && matchCity && matchCat && matchFeatured
    })
  }, [events, search, cityFilter, categoryFilter, featuredFilter])

  const openCreateModal = () => {
    setEditingEvent(null)
    setTitle('')
    setCity('Kochi')
    setEventDate(new Date().toISOString().slice(0, 16))
    setVenue('')
    setCategory('Community')
    setDescription('')
    setImageUrl('')
    setIsFeatured(false)
    setIsActive(true)
    setModalOpen(true)
  }

  const openEditModal = (e: EventRow) => {
    setEditingEvent(e)
    setTitle(e.title)
    setCity(e.city)
    setEventDate(e.event_date ? new Date(e.event_date).toISOString().slice(0, 16) : '')
    setVenue(e.venue)
    setCategory(e.category)
    setDescription(e.description || '')
    setImageUrl(e.image_url || '')
    setIsFeatured(e.is_featured)
    setIsActive(e.is_active)
    setModalOpen(true)
  }

  const handleToggleFeatured = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleEventFeatured(id, !current)
      router.refresh()
    })
  }

  const handleToggleActive = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleEventActive(id, !current)
      router.refresh()
    })
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete event "${name}"?`)) return
    startTransition(async () => {
      await deleteEvent(id)
      router.refresh()
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const payload = {
        title,
        city,
        event_date: new Date(eventDate).toISOString(),
        venue,
        category,
        description,
        image_url: imageUrl || null,
        is_featured: isFeatured,
        is_active: isActive,
      }

      if (editingEvent) {
        await updateEvent(editingEvent.id, payload)
      } else {
        await createEvent(payload)
      }
      setModalOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg shadow-black/20">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title or venue..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5B6FD0]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#5B6FD0]"
          >
            <option value="All">All Cities</option>
            <option value="Kochi">Kochi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Trivandrum">Trivandrum</option>
            <option value="Calicut">Calicut</option>
            <option value="Chennai">Chennai</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#5B6FD0]"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#5B6FD0]"
          >
            <option value="All">All Types</option>
            <option value="Featured">Featured Carousel Only</option>
            <option value="Standard">Standard Events</option>
          </select>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length > 0 ? (
          filtered.map((e) => (
            <div
              key={e.id}
              className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all shadow-lg ${
                e.is_featured
                  ? 'bg-slate-900/95 border-indigo-500/40 shadow-indigo-600/10'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div>
                {/* Event Cover Photo */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden group">
                  {e.image_url ? (
                    <img src={e.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Calendar className="w-10 h-10" />
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/70 backdrop-blur text-white border border-white/10 uppercase tracking-wide">
                      {e.category}
                    </span>
                    {e.is_featured && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-black border border-amber-300/40 shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-black" /> Hero Carousel
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggleActive(e.id, e.is_active)}
                      disabled={isPending}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur transition-all ${
                        e.is_active
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {e.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(e.event_date)}</span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug line-clamp-1">{e.title}</h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-[#5B6FD0]" />
                    <span>{e.venue}, {e.city}</span>
                  </div>

                  {e.description && (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {e.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleToggleFeatured(e.id, e.is_featured)}
                  disabled={isPending}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                    e.is_featured
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{e.is_featured ? 'Featured on Home' : 'Promote to Hero'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(e)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Edit Event"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(e.id, e.title)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-16 text-center text-sm text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
            <Calendar className="w-10 h-10 mx-auto text-slate-700 mb-2" />
            <div>No events found matching your filter criteria.</div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] text-white hover:bg-indigo-500"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Event</span>
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Kochi Tech Meetup & Mixer"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  >
                    <option value="Kochi">Kochi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Trivandrum">Trivandrum</option>
                    <option value="Calicut">Calicut</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Venue</label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Infopark Club House"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  />
                </div>
              </div>

              {/* Event Image Uploader to event-images bucket */}
              <div className="space-y-1.5">
                <ImageUploader
                  bucket="event-images"
                  currentUrl={imageUrl}
                  onUploadComplete={(url) => setImageUrl(url)}
                  label="Event Banner (Featured Carousel Image)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Home Hero Carousel</span>
                  <span className="text-[11px] text-slate-400">Puts this event in the mobile top banner</span>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#5B6FD0]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                >
                  {isPending ? 'Saving...' : editingEvent ? 'Save Changes' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
