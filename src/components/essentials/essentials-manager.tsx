'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { createEssentialPlace, toggleEssentialOpen, deleteEssentialPlace } from '@/app/essentials/actions'
import {
  ShoppingBag,
  Plus,
  Search,
  MapPin,
  Phone,
  Trash2,
  X,
} from 'lucide-react'

type PlaceRow = Database['public']['Tables']['essential_places']['Row']

interface EssentialsManagerProps {
  places: PlaceRow[]
  categoryScope?: string
  title?: string
}

const CATEGORIES = [
  'Groceries',
  'Electronics',
  'Home & Living',
  'Pharmacy',
  'Medical',
  'SIM & Internet',
  'Banking',
]

export function EssentialsManager({
  places,
  categoryScope,
  title = 'Essentials Management',
}: EssentialsManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('All')
  const [catFilter, setCatFilter] = useState(categoryScope || 'All')

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [city, setCity] = useState('Kochi')
  const [category, setCategory] = useState(categoryScope || 'Groceries')
  const [address, setAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isOpen, setIsOpen] = useState(true)

  const filtered = useMemo(() => {
    return places.filter((p) => {
      const matchSearch =
        search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.address || '').toLowerCase().includes(search.toLowerCase())

      const matchCity = cityFilter === 'All' || p.city === cityFilter
      const matchCat = catFilter === 'All' || p.category === catFilter

      return matchSearch && matchCity && matchCat
    })
  }, [places, search, cityFilter, catFilter])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await createEssentialPlace({
        name,
        city,
        category,
        address,
        phone_number: phoneNumber,
        is_open: isOpen,
      })
      setModalOpen(false)
      setName('')
      setAddress('')
      setPhoneNumber('')
      router.refresh()
    })
  }

  const handleToggleOpen = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleEssentialOpen(id, !current)
      router.refresh()
    })
  }

  const handleDelete = (id: string, placeName: string) => {
    if (!confirm(`Delete "${placeName}"?`)) return
    startTransition(async () => {
      await deleteEssentialPlace(id)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-4 rounded-2xl shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores, banks, pharmacies, utilities..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="All">All Cities</option>
            <option value="Kochi">Kochi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Trivandrum">Trivandrum</option>
            <option value="Calicut">Calicut</option>
            <option value="Chennai">Chennai</option>
          </select>

          {!categoryScope && (
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Place</span>
          </button>
        </div>
      </div>

      {/* Grid of Places */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length > 0 ? (
          filtered.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 flex flex-col justify-between shadow-2xs space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base leading-snug">{p.name}</h3>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                      {p.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleOpen(p.id, p.is_open)}
                    disabled={isPending}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                      p.is_open
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
                    }`}
                  >
                    {p.is_open ? 'Open Now' : 'Closed'}
                  </button>
                </div>

                <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 mt-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    <span>{p.address || p.city}</span>
                  </div>
                  {p.phone_number && (
                    <div className="flex items-center gap-1.5 font-mono text-zinc-600 dark:text-zinc-300">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                      <span>{p.phone_number}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">{p.city}</span>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete Place"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-16 text-center text-sm text-zinc-400 dark:text-zinc-500 bg-white dark:bg-[#111113] rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <ShoppingBag className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
            <div>No places found matching your filters.</div>
          </div>
        )}
      </div>

      {/* Add Place Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Add Place</h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apollo Pharmacy or LuLu Hypermarket"
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
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Address / Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Edappally Toll Junction"
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +91 98460 12345"
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
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
                  {isPending ? 'Saving...' : 'Add Place'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
