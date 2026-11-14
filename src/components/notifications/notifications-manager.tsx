'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils'
import { broadcastPushNotification } from '@/app/notifications/actions'
import { ImageUploader } from '@/components/shared/image-uploader'
import {
  Bell,
  Send,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Radio,
  ExternalLink,
  Sparkles
} from 'lucide-react'

type NotificationRow = Database['public']['Tables']['push_notifications']['Row']

interface NotificationsManagerProps {
  history: NotificationRow[]
}

const NOTIFICATION_TYPES = ['Announcement', 'Event Alert', 'Maintenance', 'Offer', 'New Listing']

export function NotificationsManager({ history }: NotificationsManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Composer fields
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetCity, setTargetCity] = useState('All')
  const [targetAudience, setTargetAudience] = useState('all')
  const [notificationType, setNotificationType] = useState('Announcement')
  const [deepLink, setDeepLink] = useState('reshift://home')
  const [imageUrl, setImageUrl] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg(null)

    startTransition(async () => {
      const res = await broadcastPushNotification({
        title,
        body,
        target_city: targetCity === 'All' ? ['All'] : [targetCity],
        target_audience: targetAudience,
        notification_type: notificationType,
        deep_link: deepLink,
        image_url: imageUrl || null,
      })

      if (res.success) {
        setSuccessMsg(`Push notification broadcast dispatched to ${targetCity} devices!`)
        setTitle('')
        setBody('')
        setImageUrl('')
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-8">
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Composer on Left, History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Composer */}
        <div className="lg:col-span-1 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl shadow-black/20 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Send className="w-4 h-4 text-[#5B6FD0]" />
              <span>Broadcast Composer</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Instant Dispatch
            </span>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <label>Notification Title *</label>
                <span className="text-slate-500 text-[10px]">{title.length}/65</span>
              </div>
              <input
                type="text"
                required
                maxLength={65}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Student PGs added in Fort Kochi!"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <label>Message Body *</label>
                <span className="text-slate-500 text-[10px]">{body.length}/240</span>
              </div>
              <textarea
                rows={3}
                required
                maxLength={240}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a clear, compelling message that will appear on user lock screens..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Target City</label>
                <select
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                >
                  <option value="All">All Cities</option>
                  <option value="Kochi">Kochi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Trivandrum">Trivandrum</option>
                  <option value="Calicut">Calicut</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="professionals">Working Professionals</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Type</label>
                <select
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                >
                  {NOTIFICATION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">In-App Deep Link</label>
                <select
                  value={deepLink}
                  onChange={(e) => setDeepLink(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                >
                  <option value="reshift://home">Home Screen</option>
                  <option value="reshift://housing">Find Housing</option>
                  <option value="reshift://events">Events Calendar</option>
                  <option value="reshift://community">Community Feed</option>
                  <option value="reshift://food">Food & Places</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending || !title.trim() || !body.trim()}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isPending ? 'Broadcasting...' : 'Broadcast Push Notification'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 2 Columns: Broadcast History Table */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl shadow-black/20 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Notification Dispatch History</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit trail of recent broadcasts delivered to mobile devices.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{history.length} Sent</span>
          </div>

          <div className="space-y-3">
            {history.length > 0 ? (
              history.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-white text-sm">{n.title}</div>
                      <div className="text-slate-300 mt-0.5">{n.body}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                      {n.notification_type}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300 font-medium">
                      <MapPin className="w-3 h-3 text-[#5B6FD0]" />
                      {(n.target_city || []).join(', ') || 'All Cities'}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span>Audience: {n.target_audience}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-semibold">
                      {n.delivery_count} devices reached
                    </span>
                    <span className="text-slate-500">•</span>
                    <span>{formatDate(n.sent_at || n.created_at)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-sm text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                <Bell className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                <div>No push notifications sent yet. Use the composer on the left to fire your first broadcast.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
