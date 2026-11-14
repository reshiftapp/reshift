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
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-3.5 rounded-xl shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title or venue..."
            className="w-full pl-8.5 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
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
            className="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
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
            className="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Types</option>
            <option value="Featured">Featured Carousel Only</option>
            <option value="Standard">Standard Events</option>
          </select>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((e) => (
            <div
              key={e.id}
              className={`rounded-xl border overflow-hidden flex flex-col justify-between transition-all shadow-2xs bg-white dark:bg-[#111113] ${
                e.is_featured
                  ? 'border-indigo-300 dark:border-indigo-800/60 ring-1 ring-indigo-500/20'
                  : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Event Cover Photo */}
                <div className="relative h-40 w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden group">
                  {e.image_url ? (
                    <img src={e.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <Calendar className="w-8 h-8" />
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-xs text-white border border-white/10 uppercase tracking-wide">
                      {e.category}
                    </span>
                    {e.is_featured && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-400 text-amber-950 border border-amber-300/40 shadow-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-amber-950" /> Hero Carousel
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <button
                      onClick={() => handleToggleActive(e.id, e.is_active)}
                      disabled={isPending}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium border backdrop-blur-xs transition-all cursor-pointer ${
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
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(e.event_date)}</span>
                  </div>

                  <h3 className="font-semibold text-zinc-900 dark:text-white text-sm leading-snug line-clamp-1">{e.title}</h3>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{e.venue}, {e.city}</span>
                  </div>

                  {e.description && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {e.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-3 bg-zinc-50/60 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleToggleFeatured(e.id, e.is_featured)}
                  disabled={isPending}
                  className={`text-xs font-medium px-2.5 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer ${
                    e.is_featured
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-700/60 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{e.is_featured ? 'Featured on Home' : 'Promote to Hero'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(e)}
                    className="p-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                    title="Edit Event"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(e.id, e.title)}
                    disabled={isPending}
                    className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 transition-colors cursor-pointer"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-[#111113] rounded-xl border border-zinc-200 dark:border-white/10">
            <Calendar className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
            <div>No events found matching your filter criteria.</div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Event</span>
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex items-center justify-center cursor-pointer transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Kochi Tech Meetup & Mixer"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Kochi">Kochi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Trivandrum">Trivandrum</option>
                    <option value="Calicut">Calicut</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Venue</label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Infopark Club House"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Event Image Uploader to event-images bucket */}
              <div className="space-y-1">
                <ImageUploader
                  bucket="event-images"
                  currentUrl={imageUrl}
                  onUploadComplete={(url) => setImageUrl(url)}
                  label="Event Banner (Featured Carousel Image)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-zinc-900 dark:text-white block">Home Hero Carousel</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Puts this event in the mobile top banner</span>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-2xs cursor-pointer transition-colors"
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
