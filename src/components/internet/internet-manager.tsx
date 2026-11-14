'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { formatCurrency } from '@/lib/utils'
import { createInternetPlan, toggleInternetAvailable, deleteInternetPlan } from '@/app/internet/actions'
import {
  Wifi,
  Plus,
  Phone,
  Search,
  Trash2,
  X,
  Gauge,
} from 'lucide-react'

type PlanRow = Database['public']['Tables']['internet_plans']['Row']

interface InternetManagerProps {
  plans: PlanRow[]
}

export function InternetManager({ plans }: InternetManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('All')

  const [modalOpen, setModalOpen] = useState(false)
  const [providerName, setProviderName] = useState('')
  const [city, setCity] = useState('Kochi')
  const [planSubtitle, setPlanSubtitle] = useState('High-Speed Fiber Broadband')
  const [speedMbps, setSpeedMbps] = useState(100)
  const [pricePerMonth, setPricePerMonth] = useState(699)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [status, setStatus] = useState('Available')
  const [isAvailable, setIsAvailable] = useState(true)

  const filtered = useMemo(() => {
    return plans.filter((p) => {
      const matchSearch =
        search === '' ||
        p.provider_name.toLowerCase().includes(search.toLowerCase()) ||
        (p.plan_subtitle || '').toLowerCase().includes(search.toLowerCase())

      const matchCity = cityFilter === 'All' || p.city === cityFilter
      return matchSearch && matchCity
    })
  }, [plans, search, cityFilter])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await createInternetPlan({
        provider_name: providerName,
        city,
        plan_subtitle: planSubtitle,
        speed_mbps: Number(speedMbps),
        price_per_month: Number(pricePerMonth),
        phone_number: phoneNumber,
        status,
        is_available: isAvailable,
      })
      setModalOpen(false)
      setProviderName('')
      setPhoneNumber('')
      router.refresh()
    })
  }

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleInternetAvailable(id, !current)
      router.refresh()
    })
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete plan from "${name}"?`)) return
    startTransition(async () => {
      await deleteInternetPlan(id)
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
            placeholder="Search internet providers (JioFiber, Airtel, Asianet...)..."
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
            <span>Add Internet Plan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length > 0 ? (
          filtered.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 flex flex-col justify-between shadow-2xs space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-white text-base leading-snug">{p.provider_name}</h3>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{p.city}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(p.id, p.is_available)}
                    disabled={isPending}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                      p.is_available
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
                    }`}
                  >
                    {p.is_available ? 'Available' : 'Unavailable'}
                  </button>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{p.speed_mbps ?? 100} Mbps</span>
                  </div>
                  <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(p.price_per_month ?? 0)}/mo
                  </div>
                </div>

                {p.phone_number && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 font-mono">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{p.phone_number}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={() => handleDelete(p.id, p.provider_name)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-16 text-center text-sm text-zinc-400 dark:text-zinc-500 bg-white dark:bg-[#111113] rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Wifi className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
            <div>No internet or broadband plans listed yet. Click &quot;Add Internet Plan&quot; to configure.</div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Add Internet / SIM Plan</h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Provider Name *</label>
                <input
                  type="text"
                  required
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="e.g. JioFiber or Asianet Broadband"
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
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Speed (Mbps)</label>
                  <input
                    type="number"
                    value={speedMbps}
                    onChange={(e) => setSpeedMbps(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Monthly Price (₹)</label>
                  <input
                    type="number"
                    value={pricePerMonth}
                    onChange={(e) => setPricePerMonth(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Direct Contact Phone</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 1800-896-9999"
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
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
                  {isPending ? 'Saving...' : 'Add Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
