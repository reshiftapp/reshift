'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { toggleStepActive, updateStepDetails } from '@/app/settings/actions'
import { useCity, CityMetadata } from '@/contexts/city-context'
import { useAuth } from '@/contexts/auth-context'
import {
  Settings,
  CheckCircle2,
  ListOrdered,
  MapPin,
  Edit,
  Save,
  X,
  ShieldCheck,
  Plus,
  Compass,
  ExternalLink,
  Loader2,
  Trash2,
  AlertTriangle,
  Check,
} from 'lucide-react'

type StepRow = Database['public']['Tables']['relocation_steps']['Row']

interface SettingsManagerProps {
  steps: StepRow[]
}

export function SettingsManager({ steps }: SettingsManagerProps) {
  const router = useRouter()
  const { cities, addCity, deleteCity } = useCity()
  const { isSuperAdmin } = useAuth()
  const [isPending, startTransition] = useTransition()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSubtitle, setEditSubtitle] = useState('')

  // Add City Modal State
  const [showAddCityModal, setShowAddCityModal] = useState(false)
  const [newCityName, setNewCityName] = useState('')
  const [newCityState, setNewCityState] = useState('')
  const [newCityLat, setNewCityLat] = useState('17.3850')
  const [newCityLng, setNewCityLng] = useState('78.4867')

  // Geocoding State
  const [fetchingGeo, setFetchingGeo] = useState(false)
  const [geoResult, setGeoResult] = useState<{
    address: string
    source: string
    googleMapsUrl: string
  } | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [savingCity, setSavingCity] = useState(false)

  // Delete City Modal State
  const [cityToDelete, setCityToDelete] = useState<CityMetadata | null>(null)
  const [deletingCity, setDeletingCity] = useState(false)

  // Fetch coordinates from Maps Geocoding API
  const handleFetchCoordinates = async () => {
    const trimmed = newCityName.trim()
    if (!trimmed) {
      setGeoError('Please enter a city name first')
      return
    }

    setFetchingGeo(true)
    setGeoError(null)
    setGeoResult(null)

    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not find coordinates for this city.')
      }

      setNewCityLat(data.lat.toString())
      setNewCityLng(data.lng.toString())

      if (data.state && !newCityState.trim()) {
        setNewCityState(data.state)
      }

      setGeoResult({
        address: data.formattedAddress,
        source: data.source,
        googleMapsUrl: data.googleMapsUrl || `https://www.google.com/maps?q=${data.lat},${data.lng}`,
      })
    } catch (err: any) {
      setGeoError(err.message || 'Failed to fetch coordinates. Please enter manually.')
    } finally {
      setFetchingGeo(false)
    }
  }

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCityName.trim() || !newCityState.trim()) return

    setSavingCity(true)
    const trimmedName = newCityName.trim()

    const success = await addCity({
      name: trimmedName,
      label: trimmedName,
      state: newCityState.trim(),
      centerCoordinates: {
        lat: parseFloat(newCityLat) || 12.0,
        lng: parseFloat(newCityLng) || 77.0,
      },
    })

    setSavingCity(false)

    if (success) {
      setNewCityName('')
      setNewCityState('')
      setNewCityLat('17.3850')
      setNewCityLng('78.4867')
      setGeoResult(null)
      setGeoError(null)
      setShowAddCityModal(false)
    }
  }

  const handleConfirmDeleteCity = async () => {
    if (!cityToDelete) return
    setDeletingCity(true)
    await deleteCity(cityToDelete.name, cityToDelete.id)
    setDeletingCity(false)
    setCityToDelete(null)
  }

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleStepActive(id, !current)
      router.refresh()
    })
  }

  const handleSave = (id: string) => {
    startTransition(async () => {
      await updateStepDetails(id, editTitle, editSubtitle)
      setEditingId(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* SECTION 1: 5-Step Relocation Checklist */}
      <div className="rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Relocation Checklist Steps Sequence</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              These are the core 5 onboarding steps tracked in the mobile app home screen for incoming residents.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {steps.map((step) => {
            const isEditing = editingId === step.id
            return (
              <div
                key={step.id}
                className="p-3.5 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-7 h-7 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/40 flex-shrink-0">
                    {step.sort_order}
                  </div>
                  {isEditing ? (
                    <div className="space-y-2 flex-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-700 dark:text-zinc-300"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-white">{step.title}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{step.subtitle}</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSave(step.id)}
                        disabled={isPending}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(step.id)
                          setEditTitle(step.title)
                          setEditSubtitle(step.subtitle || '')
                        }}
                        className="p-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggle(step.id, step.is_active)}
                        disabled={isPending}
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium border transition-all cursor-pointer ${
                          step.is_active
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40'
                        }`}
                      >
                        {step.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SECTION 2: Active Service Hub Cities */}
      <div className="rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80 gap-3">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Supported Operational Cities ({cities.filter((c) => c.name !== 'All').length})</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Active metropolitan regions selectable across the mobile app, properties catalog, and local feeds.
            </p>
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => {
                setShowAddCityModal(true)
                setGeoResult(null)
                setGeoError(null)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New City</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cities
            .filter((c) => c.name !== 'All')
            .map((c) => (
              <div
                key={c.name}
                className="p-3.5 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3 group"
              >
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white text-xs flex items-center gap-1.5">
                    <span>{c.label}</span>
                    <a
                      href={`https://www.google.com/maps?q=${c.centerCoordinates.lat},${c.centerCoordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in Google Maps"
                      className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{c.state}</div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                    {c.centerCoordinates.lat.toFixed(4)}, {c.centerCoordinates.lng.toFixed(4)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                    Live
                  </span>

                  {/* Super Admin Permanent Delete Button */}
                  {isSuperAdmin && (
                    <button
                      onClick={() => setCityToDelete(c)}
                      title={`Permanently delete ${c.name} from database`}
                      className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ADD CITY MODAL WITH GOOGLE MAPS FETCH */}
      {showAddCityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Add Operational City</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Expand ReShift services to a new metropolitan hub</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCityModal(false)}
                className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleAddCity} className="space-y-3.5">
              {/* City Name with Google Maps Fetch Button */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  City Name *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad, Pune, Delhi"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleFetchCoordinates}
                    disabled={fetchingGeo || !newCityName.trim()}
                    className="px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer flex-shrink-0"
                    title="Automatically fetch latitude and longitude from Google Maps"
                  >
                    {fetchingGeo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Fetch from Maps</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Geocoding Status Result */}
              {geoResult && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Coordinates Detected
                    </span>
                    <a
                      href={geoResult.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] underline hover:text-emerald-900 dark:hover:text-emerald-100"
                    >
                      <span>Preview in Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400 truncate">
                    {geoResult.address}
                  </p>
                </div>
              )}

              {geoError && (
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300">
                  {geoError}
                </div>
              )}

              {/* State / Union Territory */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  State / Union Territory *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telangana, Maharashtra, Karnataka"
                  value={newCityState}
                  onChange={(e) => setNewCityState(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newCityLat}
                    onChange={(e) => setNewCityLat(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newCityLng}
                    onChange={(e) => setNewCityLng(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddCityModal(false)}
                  disabled={savingCity}
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCity || fetchingGeo}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors disabled:opacity-50"
                >
                  {savingCity ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to DB...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add City</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PERMANENT CITY DELETION MODAL (SUPER ADMIN ONLY) */}
      {cityToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
                  Permanently Delete Operational City?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Super Admin Governance Action
                </p>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">City Name:</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{cityToDelete.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">State / Region:</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{cityToDelete.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Coordinates:</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {cityToDelete.centerCoordinates.lat}, {cityToDelete.centerCoordinates.lng}
                </span>
              </div>
            </div>

            <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
              ⚠️ This will permanently remove <strong>{cityToDelete.name}</strong> from the database and all operational dropdowns across the mobile app, properties catalog, and local guides. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={() => setCityToDelete(null)}
                disabled={deletingCity}
                className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCity}
                disabled={deletingCity}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors disabled:opacity-50"
              >
                {deletingCity ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting from DB...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete City</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
