'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { toggleStepActive, updateStepDetails } from '@/app/settings/actions'
import { useCity } from '@/contexts/city-context'
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
} from 'lucide-react'

type StepRow = Database['public']['Tables']['relocation_steps']['Row']

interface SettingsManagerProps {
  steps: StepRow[]
}

export function SettingsManager({ steps }: SettingsManagerProps) {
  const router = useRouter()
  const { cities, addCity } = useCity()
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

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCityName.trim() || !newCityState.trim()) return

    const trimmedName = newCityName.trim()
    addCity({
      name: trimmedName,
      label: trimmedName,
      state: newCityState.trim(),
      centerCoordinates: {
        lat: parseFloat(newCityLat) || 12.0,
        lng: parseFloat(newCityLng) || 77.0,
      },
    })

    setNewCityName('')
    setNewCityState('')
    setShowAddCityModal(false)
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
              onClick={() => setShowAddCityModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New City</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cities.filter((c) => c.name !== 'All').map((c) => (
            <div
              key={c.name}
              className="p-3.5 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-zinc-900 dark:text-white text-xs">{c.label}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{c.state}</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                  Coords: {c.centerCoordinates.lat}, {c.centerCoordinates.lng}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                Live
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ADD CITY MODAL */}
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
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">City Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad, Pune, Delhi"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">State / Union Territory *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telangana, Maharashtra"
                  value={newCityState}
                  onChange={(e) => setNewCityState(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newCityLat}
                    onChange={(e) => setNewCityLat(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newCityLng}
                    onChange={(e) => setNewCityLng(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddCityModal(false)}
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add City</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
