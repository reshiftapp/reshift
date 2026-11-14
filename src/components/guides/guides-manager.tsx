'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { createLocalGuide, deleteLocalGuide } from '@/app/guides/actions'
import { ImageUploader } from '@/components/shared/image-uploader'
import {
  BookOpen,
  Plus,
  Search,
  MapPin,
  Trash2,
  X,
  Compass
} from 'lucide-react'

type GuideRow = Database['public']['Tables']['local_guides']['Row']

interface GuidesManagerProps {
  guides: GuideRow[]
}

const CATEGORIES = ['Explore', 'Food', 'Culture', 'Nightlife', 'Shopping', 'Nature']

export function GuidesManager({ guides }: GuidesManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('All')

  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [city, setCity] = useState('Kochi')
  const [category, setCategory] = useState('Explore')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const filtered = useMemo(() => {
    return guides.filter((g) => {
      const matchSearch =
        search === '' ||
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        (g.description || '').toLowerCase().includes(search.toLowerCase())

      const matchCity = cityFilter === 'All' || g.city === cityFilter
      return matchSearch && matchCity
    })
  }, [guides, search, cityFilter])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await createLocalGuide({
        title,
        city,
        category,
        description,
        image_url: imageUrl || null,
      })
      setModalOpen(false)
      setTitle('')
      setDescription('')
      setImageUrl('')
      router.refresh()
    })
  }

  const handleDelete = (id: string, guideTitle: string) => {
    if (!confirm(`Delete "${guideTitle}"?`)) return
    startTransition(async () => {
      await deleteLocalGuide(id)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search local city guides and insider articles..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="All">All Cities</option>
            <option value="Kochi">Kochi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Trivandrum">Trivandrum</option>
            <option value="Calicut">Calicut</option>
            <option value="Chennai">Chennai</option>
          </select>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Guide Entry</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length > 0 ? (
          filtered.map((g) => (
            <div
              key={g.id}
              className="rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 overflow-hidden flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="relative h-44 w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                  {g.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                      <Compass className="w-10 h-10" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/70 backdrop-blur text-white border border-white/10 uppercase">
                    {g.category || 'Explore'}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-zinc-900 dark:text-white text-base leading-snug">{g.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{g.city}</span>
                  </div>
                  {g.description && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed mt-1">
                      {g.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={() => handleDelete(g.id, g.title)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-16 text-center text-sm text-zinc-400 dark:text-zinc-500 bg-white dark:bg-[#111113] rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <BookOpen className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
            <div>No local city guides written yet. Click &quot;Add Guide Entry&quot; to publish one.</div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Create Local Guide Entry</h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Article Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Best Cafés in Fort Kochi for Remote Work"
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="Kochi">Kochi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Trivandrum">Trivandrum</option>
                    <option value="Calicut">Calicut</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <ImageUploader
                  bucket="guide-images"
                  currentUrl={imageUrl}
                  onUploadComplete={(url) => setImageUrl(url)}
                  label="Guide Cover Photo"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Content / Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write an insightful recommendation for newly relocated residents..."
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white cursor-pointer shadow-2xs"
                >
                  {isPending ? 'Publishing...' : 'Publish Guide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
