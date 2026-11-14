'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { createEmergencyService, deleteEmergencyService } from '@/app/emergency/actions'
import {
  AlertTriangle,
  Plus,
  Phone,
  Search,
  Trash2,
  X,
  Shield,
  Ambulance,
  Flame,
  Hospital
} from 'lucide-react'

type EmergencyRow = Database['public']['Tables']['emergency_services']['Row']

interface EmergencyManagerProps {
  services: EmergencyRow[]
}

const CATEGORIES = ['Police', 'Ambulance', 'Fire', "Women's Helpline", 'Hospital']

export function EmergencyManager({ services }: EmergencyManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('All')

  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [city, setCity] = useState('Kochi')
  const [category, setCategory] = useState('Police')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [description, setDescription] = useState('')

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        search === '' ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.phone_number.toLowerCase().includes(search.toLowerCase())

      const matchCity = cityFilter === 'All' || s.city === cityFilter
      return matchSearch && matchCity
    })
  }, [services, search, cityFilter])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await createEmergencyService({
        name,
        city,
        category,
        phone_number: phoneNumber,
        description,
        sort_order: 1,
      })
      setModalOpen(false)
      setName('')
      setPhoneNumber('')
      setDescription('')
      router.refresh()
    })
  }

  const handleDelete = (id: string, servName: string) => {
    if (!confirm(`Delete "${servName}"?`)) return
    startTransition(async () => {
      await deleteEmergencyService(id)
      router.refresh()
    })
  }

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'Ambulance':
        return Ambulance
      case 'Fire':
        return Flame
      case 'Hospital':
        return Hospital
      default:
        return Shield
    }
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
            placeholder="Search emergency services & helplines..."
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Emergency Number</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((s) => {
            const Icon = getIcon(s.category)
            return (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start justify-between shadow-lg shadow-black/20"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{s.name}</h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      {s.category} • {s.city}
                    </span>
                    <div className="mt-2 text-sm font-bold text-rose-400 font-mono flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{s.phone_number}</span>
                    </div>
                    {s.description && (
                      <p className="text-xs text-slate-400 mt-1">{s.description}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(s.id, s.name)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })
        ) : (
          <div className="col-span-full p-16 text-center text-sm text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
            <AlertTriangle className="w-10 h-10 mx-auto text-slate-700 mb-2" />
            <div>No emergency services registered yet. Click &quot;Add Emergency Number&quot; to populate.</div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Emergency Contact</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Service Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ernakulam General Hospital"
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
                <label className="text-xs font-semibold text-slate-300">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 112 or 0484-2361234"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 24/7 Trauma Care & Ambulance"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
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
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                >
                  {isPending ? 'Saving...' : 'Add Emergency Number'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
