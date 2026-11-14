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
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search local city guides and insider articles..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5B6FD0]"
          />
        </div>

        <div className="flex items-center gap-2.5">
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

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
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
              className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden flex flex-col justify-between shadow-lg shadow-black/20"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  {g.image_url ? (
                    <img src={g.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Compass className="w-10 h-10" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/70 backdrop-blur text-white border border-white/10 uppercase">
                    {g.category || 'Explore'}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-white text-base leading-snug">{g.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#5B6FD0] font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{g.city}</span>
                  </div>
                  {g.description && (
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mt-1">
                      {g.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleDelete(g.id, g.title)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-16 text-center text-sm text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
            <BookOpen className="w-10 h-10 mx-auto text-slate-700 mb-2" />
            <div>No local city guides written yet. Click &quot;Add Guide Entry&quot; to publish one.</div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Local Guide Entry</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Article Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Best Cafés in Fort Kochi for Remote Work"
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

              <div className="space-y-1.5">
                <ImageUploader
                  bucket="guide-images"
                  currentUrl={imageUrl}
                  onUploadComplete={(url) => setImageUrl(url)}
                  label="Guide Cover Photo"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Content / Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write an insightful recommendation for newly relocated residents..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
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
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 text-white"
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
