'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import {
  createTransportStop,
  deleteTransportStop,
  createBusRoute,
  deleteBusRoute,
  toggleRouteActive,
} from '@/app/transport/actions'
import {
  Bus,
  MapPin,
  Plus,
  Trash2,
  Clock,
  Search,
  Navigation,
  ArrowRight,
  X,
  CheckCircle2
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
      <div className="flex items-center gap-3 border-b border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'routes'
              ? 'border-[#5B6FD0] text-white bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>Bus Routes ({routes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stops')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'stops'
              ? 'border-[#5B6FD0] text-white bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Transport & Metro Stops ({stops.length})</span>
        </button>
      </div>

      {activeTab === 'routes' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by route number, origin, or destination..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5B6FD0]"
              />
            </div>
            <button
              onClick={() => setRouteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
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
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg shadow-black/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-[#5B6FD0] font-black text-sm flex items-center justify-center border border-indigo-500/30">
                          {r.route_number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-bold text-white text-sm">
                            <span>{r.origin}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                            <span>{r.destination}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{r.city}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteRoute(r.id, r.route_number)}
                        disabled={isPending}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Delete Route"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Next Bus: in {r.next_bus_minutes ?? 10} mins</span>
                      </div>
                      {r.subsequent_buses_minutes && (
                        <span className="text-slate-500 border-l border-slate-800 pl-3">
                          Upcoming: {r.subsequent_buses_minutes} mins
                        </span>
                      )}
                    </div>

                    {/* Ordered Stop Sequence */}
                    {stopsForThisRoute.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                          Transit Sequence ({stopsForThisRoute.length} Stops)
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {stopsForThisRoute
                            .sort((a, b) => a.stop_order - b.stop_order)
                            .map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700"
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
              <div className="col-span-full p-12 text-center text-sm text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
                No bus routes registered yet. Click &quot;Add Bus Route&quot; to configure schedules.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Stops Directory Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transport stops..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5B6FD0]"
              />
            </div>
            <button
              onClick={() => setStopModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stop</span>
            </button>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl shadow-black/20">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Stop Name</th>
                  <th className="px-6 py-3.5">City</th>
                  <th className="px-6 py-3.5">Distance</th>
                  <th className="px-6 py-3.5">Route Information</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStops.length > 0 ? (
                  filteredStops.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#5B6FD0]" />
                        <span>{s.name}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">{s.city}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-300">
                        {s.distance || '—'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">{s.route_info || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteStop(s.id, s.name)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add New Bus Route</h3>
              <button onClick={() => setRouteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRoute} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Route Number *</label>
                  <input
                    type="text"
                    required
                    value={routeNumber}
                    onChange={(e) => setRouteNumber(e.target.value)}
                    placeholder="e.g. 307 or 11A"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Origin *</label>
                  <input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Aluva"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Destination *</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Thoppumpady"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Next Bus (mins)</label>
                  <input
                    type="number"
                    value={nextBusMinutes}
                    onChange={(e) => setNextBusMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Upcoming Buses (mins)</label>
                  <input
                    type="text"
                    value={subsequentMinutes}
                    onChange={(e) => setSubsequentMinutes(e.target.value)}
                    placeholder="e.g. 25, 40, 60"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Ordered Stops (Comma separated)</label>
                <textarea
                  rows={3}
                  value={stopsText}
                  onChange={(e) => setStopsText(e.target.value)}
                  placeholder="e.g. Edappally, Palarivattom, Kaloor, MG Road"
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRouteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 text-white"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Transport Stop</h3>
              <button onClick={() => setStopModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStop} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Stop Name *</label>
                <input
                  type="text"
                  required
                  value={stopName}
                  onChange={(e) => setStopName(e.target.value)}
                  placeholder="e.g. JLN Stadium Metro"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">City</label>
                  <select
                    value={stopCity}
                    onChange={(e) => setStopCity(e.target.value)}
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
                  <label className="text-xs font-semibold text-slate-300">Distance</label>
                  <input
                    type="text"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="e.g. 0.3 km"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Route Info</label>
                <input
                  type="text"
                  value={routeInfo}
                  onChange={(e) => setRouteInfo(e.target.value)}
                  placeholder="e.g. Auto stand & Feeder Bus"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStopModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 text-white"
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
