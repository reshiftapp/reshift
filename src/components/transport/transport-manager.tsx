'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import {
  createTransportStop,
  deleteTransportStop,
  createBusRoute,
  deleteBusRoute,
} from '@/app/transport/actions'
import {
  Bus,
  MapPin,
  Plus,
  Trash2,
  Clock,
  Search,
  ArrowRight,
  X,
} from 'lucide-react'

type RouteRow = Database['public']['Tables']['bus_routes']['Row']
type StopRow = Database['public']['Tables']['transport_stops']['Row']
type RouteStopRow = Database['public']['Tables']['bus_route_stops']['Row']

interface TransportManagerProps {
  routes: RouteRow[]
  stops: StopRow[]
  routeStops: RouteStopRow[]
}

export function TransportManager({ routes, stops, routeStops }: TransportManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'routes' | 'stops'>('routes')
  const [search, setSearch] = useState('')

  // Route Modal State
  const [routeModalOpen, setRouteModalOpen] = useState(false)
  const [routeNumber, setRouteNumber] = useState('')
  const [city, setCity] = useState('Kochi')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [nextBusMinutes, setNextBusMinutes] = useState(12)
  const [subsequentMinutes, setSubsequentMinutes] = useState('24, 38, 55')
  const [stopsText, setStopsText] = useState('Edappally, Palarivattom, Kaloor, MG Road')

  // Stop Modal State
  const [stopModalOpen, setStopModalOpen] = useState(false)
  const [stopName, setStopName] = useState('')
  const [stopCity, setStopCity] = useState('Kochi')
  const [distance, setDistance] = useState('0.4 km')
  const [routeInfo, setRouteInfo] = useState('Metro & Bus Interchange')

  // Map route stops by route ID
  const stopsByRoute = useMemo(() => {
    const map = new Map<string, RouteStopRow[]>()
    routeStops.forEach((rs) => {
      const list = map.get(rs.route_id) || []
      list.push(rs)
      map.set(rs.route_id, list)
    })
    return map
  }, [routeStops])

  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      return (
        search === '' ||
        r.route_number.toLowerCase().includes(search.toLowerCase()) ||
        r.origin.toLowerCase().includes(search.toLowerCase()) ||
        r.destination.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [routes, search])

  const filteredStops = useMemo(() => {
    return stops.filter((s) => {
      return (
        search === '' ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.route_info || '').toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [stops, search])

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const stopList = stopsText.split(',').map((s) => s.trim()).filter(Boolean)
      await createBusRoute(
        {
          route_number: routeNumber,
          city,
          origin,
          destination,
          next_bus_minutes: Number(nextBusMinutes),
          subsequent_buses_minutes: subsequentMinutes,
          is_active: true,
        },
        stopList
      )
      setRouteModalOpen(false)
      router.refresh()
    })
  }

  const handleCreateStop = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await createTransportStop({
        name: stopName,
        city: stopCity,
        distance,
        route_info: routeInfo,
        is_active: true,
      })
      setStopModalOpen(false)
      router.refresh()
    })
  }

  const handleDeleteRoute = (id: string, num: string) => {
    if (!confirm(`Delete route ${num}?`)) return
    startTransition(async () => {
      await deleteBusRoute(id)
      router.refresh()
    })
  }

  const handleDeleteStop = (id: string, name: string) => {
    if (!confirm(`Delete stop "${name}"?`)) return
    startTransition(async () => {
      await deleteTransportStop(id)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-px">
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'routes'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/20'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>Bus Routes ({routes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stops')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'stops'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/20'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Transport & Metro Stops ({stops.length})</span>
        </button>
      </div>

      {activeTab === 'routes' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by route number, origin, or destination..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            <button
              onClick={() => setRouteModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bus Route</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRoutes.length > 0 ? (
              filteredRoutes.map((r) => {
                const stopsForThisRoute = stopsByRoute.get(r.id) || []
                return (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 space-y-4 shadow-2xs"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center border border-indigo-200 dark:border-indigo-800/60">
                          {r.route_number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white text-sm">
                            <span>{r.origin}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{r.destination}</span>
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{r.city}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteRoute(r.id, r.route_number)}
                        disabled={isPending}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Route"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Next Bus: in {r.next_bus_minutes ?? 10} mins</span>
                      </div>
                      {r.subsequent_buses_minutes && (
                        <span className="text-zinc-500 dark:text-zinc-400 border-l border-zinc-200 dark:border-zinc-800 pl-3">
                          Upcoming: {r.subsequent_buses_minutes} mins
                        </span>
                      )}
                    </div>

                    {/* Ordered Stop Sequence */}
                    {stopsForThisRoute.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400 font-semibold text-[11px] uppercase tracking-wider">
                          Transit Sequence ({stopsForThisRoute.length} Stops)
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {stopsForThisRoute
                            .sort((a, b) => a.stop_order - b.stop_order)
                            .map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium border border-zinc-200 dark:border-zinc-700"
                              >
                                {s.stop_order}. {s.stop_name}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="col-span-full p-12 text-center text-sm text-zinc-400 dark:text-zinc-500 bg-white dark:bg-[#111113] rounded-2xl border border-zinc-200 dark:border-zinc-800">
                No bus routes registered yet. Click &quot;Add Bus Route&quot; to configure schedules.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Stops Directory Tab */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transport stops..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            <button
              onClick={() => setStopModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stop</span>
            </button>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
              <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Stop Name</th>
                  <th className="px-6 py-3.5">City</th>
                  <th className="px-6 py-3.5">Distance</th>
                  <th className="px-6 py-3.5">Route Information</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredStops.length > 0 ? (
                  filteredStops.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>{s.name}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">{s.city}</td>
                      <td className="px-6 py-4 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {s.distance || '—'}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-600 dark:text-zinc-300">{s.route_info || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteStop(s.id, s.name)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
                      No transit stops added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {routeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Add New Bus Route</h3>
              <button onClick={() => setRouteModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRoute} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Route Number *</label>
                  <input
                    type="text"
                    required
                    value={routeNumber}
                    onChange={(e) => setRouteNumber(e.target.value)}
                    placeholder="e.g. 307 or 11A"
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="Kochi">Kochi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Trivandrum">Trivandrum</option>
                    <option value="Calicut">Calicut</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Origin *</label>
                  <input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Aluva"
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Destination *</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Thoppumpady"
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Next Bus (mins)</label>
                  <input
                    type="number"
                    value={nextBusMinutes}
                    onChange={(e) => setNextBusMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Upcoming Buses (mins)</label>
                  <input
                    type="text"
                    value={subsequentMinutes}
                    onChange={(e) => setSubsequentMinutes(e.target.value)}
                    placeholder="e.g. 25, 40, 60"
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Ordered Stops (Comma separated)</label>
                <textarea
                  rows={3}
                  value={stopsText}
                  onChange={(e) => setStopsText(e.target.value)}
                  placeholder="e.g. Edappally, Palarivattom, Kaloor, MG Road"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRouteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white cursor-pointer shadow-2xs"
                >
                  {isPending ? 'Saving...' : 'Add Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stop Modal */}
      {stopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Add Transport Stop</h3>
              <button onClick={() => setStopModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStop} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Stop Name *</label>
                <input
                  type="text"
                  required
                  value={stopName}
                  onChange={(e) => setStopName(e.target.value)}
                  placeholder="e.g. JLN Stadium Metro"
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">City</label>
                  <select
                    value={stopCity}
                    onChange={(e) => setStopCity(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="Kochi">Kochi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Trivandrum">Trivandrum</option>
                    <option value="Calicut">Calicut</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Distance</label>
                  <input
                    type="text"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="e.g. 0.3 km"
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Route Info</label>
                <input
                  type="text"
                  value={routeInfo}
                  onChange={(e) => setRouteInfo(e.target.value)}
                  placeholder="e.g. Auto stand & Feeder Bus"
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStopModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white cursor-pointer shadow-2xs"
                >
                  {isPending ? 'Saving...' : 'Add Stop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
