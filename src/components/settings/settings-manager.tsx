'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { toggleStepActive, updateStepDetails } from '@/app/settings/actions'
import { CITIES } from '@/contexts/city-context'
import {
  Settings,
  CheckCircle2,
  ListOrdered,
  MapPin,
  Edit,
  Save,
  X,
  ShieldCheck
} from 'lucide-react'

type StepRow = Database['public']['Tables']['relocation_steps']['Row']

interface SettingsManagerProps {
  steps: StepRow[]
}

export function SettingsManager({ steps }: SettingsManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSubtitle, setEditSubtitle] = useState('')

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
    <div className="space-y-8 max-w-5xl">
      {/* SECTION 1: 5-Step Relocation Checklist */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl shadow-black/20 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-[#5B6FD0]" />
              <span>Relocation Checklist Steps Sequence</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              These are the core 5 onboarding steps tracked in the mobile app home screen for incoming residents.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step) => {
            const isEditing = editingId === step.id
            return (
              <div
                key={step.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-[#5B6FD0] font-black text-xs flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
                    {step.sort_order}
                  </div>
                  {isEditing ? (
                    <div className="space-y-2 flex-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                      <input
                        type="text"
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-bold text-white">{step.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{step.subtitle}</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSave(step.id)}
                        disabled={isPending}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#5B6FD0] text-white hover:bg-indigo-500"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 text-xs text-slate-400 hover:text-white"
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
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggle(step.id, step.is_active)}
                        disabled={isPending}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          step.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
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
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl shadow-black/20 space-y-4">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#5B6FD0]" />
            <span>Supported Operational Cities</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active metropolitan regions supported in the mobile app city selector.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CITIES.filter((c) => c.name !== 'All').map((c) => (
            <div
              key={c.name}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-white text-sm">{c.label}</div>
                <div className="text-xs text-slate-400">{c.state}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  Coords: {c.centerCoordinates.lat}, {c.centerCoordinates.lng}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
