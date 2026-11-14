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
  CheckCircle2
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
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search internet providers (JioFiber, Airtel, Asianet...)..."
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
            <span>Add Internet Plan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length > 0 ? (
          filtered.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-lg shadow-black/20 space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-indigo-600/10 text-[#5B6FD0] border border-indigo-500/20">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">{p.provider_name}</h3>
                      <div className="text-xs text-slate-400 mt-0.5">{p.city}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(p.id, p.is_available)}
                    disabled={isPending}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                      p.is_available
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {p.is_available ? 'Available' : 'Unavailable'}
                  </button>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-extrabold text-white">{p.speed_mbps ?? 100} Mbps</span>
                  </div>
                  <div className="text-sm font-extrabold text-[#5B6FD0]">
                    {formatCurrency(p.price_per_month ?? 0)}/mo
                  </div>
                </div>

                {p.phone_number && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{p.phone_number}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleDelete(p.id, p.provider_name)}
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
            <Wifi className="w-10 h-10 mx-auto text-slate-700 mb-2" />
            <div>No internet or broadband plans listed yet. Click &quot;Add Internet Plan&quot; to configure.</div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Internet / SIM Plan</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Provider Name *</label>
                <input
                  type="text"
                  required
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="e.g. JioFiber or Asianet Broadband"
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
                  <label className="text-xs font-semibold text-slate-300">Speed (Mbps)</label>
                  <input
                    type="number"
                    value={speedMbps}
                    onChange={(e) => setSpeedMbps(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Monthly Price (₹)</label>
                  <input
                    type="number"
                    value={pricePerMonth}
                    onChange={(e) => setPricePerMonth(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Direct Contact Phone</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 1800-896-9999"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  />
                </div>
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
