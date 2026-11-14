'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils'
import {
  updateUserSuspension,
  updateModeratorRole,
  sendPasswordReset,
  toggleRelocationStep,
  deletePostByModerator,
  deleteReplyByModerator,
} from '@/app/users/actions'
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  KeyRound,
  CheckCircle2,
  Circle,
  MessageSquare,
  Home,
  LifeBuoy,
  Trash2,
  Calendar,
  MapPin,
  Mail,
  User,
  AlertCircle,
  Lock
} from 'lucide-react'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type StepRow = Database['public']['Tables']['relocation_steps']['Row']
type UserStepRow = Database['public']['Tables']['user_relocation_steps']['Row']
type PostRow = Database['public']['Tables']['community_posts']['Row']
type ReplyRow = Database['public']['Tables']['community_replies']['Row']
type TicketRow = Database['public']['Tables']['support_tickets']['Row']

interface UserDetailViewProps {
  user: ProfileRow
  relocationSteps: StepRow[]
  userSteps: UserStepRow[]
  posts: PostRow[]
  replies: ReplyRow[]
  tickets: TicketRow[]
}

export function UserDetailView({
  user,
  relocationSteps,
  userSteps,
  posts,
  replies,
  tickets,
}: UserDetailViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'posts' | 'tickets'>('overview')
  const [suspensionModalOpen, setSuspensionModalOpen] = useState(false)
  const [suspensionReason, setSuspensionReason] = useState(user.suspension_reason || '')
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Fast lookup of completed steps
  const completedMap = new Set(userSteps.filter((s) => s.is_completed).map((s) => s.step_id))

  const handleToggleSuspension = async (suspend: boolean) => {
    startTransition(async () => {
      const res = await updateUserSuspension(user.id, suspend, suspensionReason)
      if (res.success) {
        setFeedback({
          message: suspend ? 'Account successfully suspended.' : 'Account reactivated.',
          type: 'success',
        })
        setSuspensionModalOpen(false)
        router.refresh()
      } else {
        setFeedback({ message: res.error || 'Failed to update status', type: 'error' })
      }
    })
  }

  const handleRoleChange = async (newRole: any) => {
    startTransition(async () => {
      const res = await updateModeratorRole(user.id, newRole)
      if (res.success) {
        setFeedback({ message: 'Moderator role updated successfully.', type: 'success' })
        router.refresh()
      } else {
        setFeedback({ message: res.error || 'Failed to update role', type: 'error' })
      }
    })
  }

  const handlePasswordReset = async () => {
    startTransition(async () => {
      const res = await sendPasswordReset(user.email)
      if (res.success) {
        setFeedback({ message: `Password reset email dispatched to ${user.email}.`, type: 'success' })
      } else {
        setFeedback({ message: res.error || 'Failed to send reset email', type: 'error' })
      }
    })
  }

  const handleToggleChecklist = async (stepId: string, currentCompleted: boolean) => {
    startTransition(async () => {
      const res = await toggleRelocationStep(user.id, stepId, !currentCompleted)
      if (res.success) {
        router.refresh()
      }
    })
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this community post permanently?')) return
    startTransition(async () => {
      const res = await deletePostByModerator(postId, user.id)
      if (res.success) {
        setFeedback({ message: 'Post removed.', type: 'success' })
        router.refresh()
      }
    })
  }

  const isSuperAdminUser = user.email === 'reshiftapp@gmail.com' || user.moderator_role === 'super_admin'
  const initials = isSuperAdminUser ? 'RA' : (user.full_name || user.email).slice(0, 2).toUpperCase()
  const displayName = isSuperAdminUser ? 'ReShift Super Admin' : (user.full_name || 'Anonymous User')

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/users"
          className="p-2 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">User Profile & Activity Dossier</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">ID: {user.id}</p>
        </div>
      </div>

      {/* Status Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/40 text-rose-700 dark:text-rose-400'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-5 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-4">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
                className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800"
              />
            ) : (
              <div className={`w-14 h-14 rounded-xl font-extrabold text-lg flex items-center justify-center shadow-2xs ${
                isSuperAdminUser
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
              }`}>
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{displayName}</h2>
                {isSuperAdminUser && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                    <ShieldCheck className="w-3 h-3" /> Super Admin
                  </span>
                )}
                {user.is_suspended && !isSuperAdminUser && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 uppercase">
                    Suspended
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {isSuperAdminUser ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold border border-indigo-200/60 dark:border-indigo-800/40">
                    Root Governance
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 text-[11px] font-medium border border-zinc-200/60 dark:border-zinc-700/60">
                    {user.role || 'Other'}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 text-[11px] font-medium border border-zinc-200/60 dark:border-zinc-700/60 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> {isSuperAdminUser ? 'All (Global)' : (user.city || 'No City Set')}
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Joined {formatDate(user.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {isSuperAdminUser ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold select-none">
                <Lock className="w-3.5 h-3.5" />
                <span>Permanent Super Admin (Immutable Root)</span>
              </div>
            ) : (
              <>
                {/* Password Reset */}
                <button
                  onClick={handlePasswordReset}
                  disabled={isPending}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 transition-colors flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Reset Password</span>
                </button>

                {/* Suspend / Unsuspend */}
                {user.is_suspended ? (
                  <button
                    onClick={() => handleToggleSuspension(false)}
                    disabled={isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Reactivate User</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setSuspensionModalOpen(true)}
                    disabled={isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Suspend Account</span>
                  </button>
                )}

                {/* Moderator Role Selector */}
                <select
                  value={user.moderator_role || ''}
                  onChange={(e) => handleRoleChange(e.target.value || null)}
                  disabled={isPending}
                  className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Standard User</option>
                  <option value="content_editor">Content Editor</option>
                  <option value="moderator">Moderator</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Super Admin Protection Banner */}
        {isSuperAdminUser && (
          <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Super Administrator Access Lock:</span> This is the primary root administrative account for ReShift. System access, ownership, and governance privileges are permanent and cannot be revoked, suspended, or modified by any user or moderator.
            </div>
          </div>
        )}

        {/* Suspension Reason Banner if Suspended */}
        {user.is_suspended && !isSuperAdminUser && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Suspension Notice:</span>{' '}
              {user.suspension_reason || 'No specific reason entered.'}
              {user.suspended_at && (
                <span className="block text-[11px] text-rose-500 dark:text-rose-400/80 mt-0.5">
                  Applied on {formatDate(user.suspended_at)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-800 pb-px">
          {[
            { id: 'overview', label: 'Relocation Progress', count: `${completedMap.size}/${relocationSteps.length}` },
            { id: 'posts', label: 'Community Posts', count: posts.length },
            { id: 'tickets', label: 'Support Tickets', count: tickets.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[#5B6FD0] text-white bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* TAB 1: Relocation Checklist Progress */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white">5-Step Relocation Checklist State</h4>
              <span className="text-xs text-slate-400">
                Moderator can toggle checklist items on behalf of the user
              </span>
            </div>
            {relocationSteps.map((step) => {
              const isCompleted = completedMap.has(step.id)
              return (
                <div
                  key={step.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-slate-950/60 border-emerald-500/30'
                      : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleChecklist(step.id, isCompleted)}
                      disabled={isPending}
                      className="mt-0.5 text-slate-400 hover:scale-110 transition-transform"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>
                    <div>
                      <div className={`text-sm font-semibold ${isCompleted ? 'text-slate-200 line-through' : 'text-white'}`}>
                        {step.title}
                      </div>
                      {step.subtitle && (
                        <div className="text-xs text-slate-400 mt-0.5">{step.subtitle}</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleChecklist(step.id, isCompleted)}
                    disabled={isPending}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {isCompleted ? 'Mark Pending' : 'Mark Completed'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* TAB 2: Community Posts */}
        {activeTab === 'posts' && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-bold text-white mb-2">Authored Community Discussions</h4>
            {posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold">
                        {post.category}
                      </span>
                      {post.city && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {post.city}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500">{formatDate(post.created_at)}</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{post.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    disabled={isPending}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                No community discussions created by this user yet.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Support Tickets */}
        {activeTab === 'tickets' && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-bold text-white mb-2">Support Ticket Submissions</h4>
            {tickets.length > 0 ? (
              tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">#{t.ticket_number || t.id.slice(0, 8)}</span>
                      <span className="text-xs text-slate-300 font-medium">{t.subject}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{t.description}</p>
                    <div className="text-[11px] text-slate-500 mt-2">Submitted {formatDate(t.created_at)}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {t.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                No support tickets raised by this user.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suspension Confirmation Modal */}
      {suspensionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Suspend User Account</h3>
            </div>
            <p className="text-xs text-slate-400">
              Suspending this account will block the user from logging into the Reshift mobile app and interacting with community posts.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Mandatory Suspension Reason</label>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="e.g. Inappropriate conduct, spamming community feed..."
                className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSuspensionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleSuspension(true)}
                disabled={isPending || !suspensionReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
