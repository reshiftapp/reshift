'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Trash2,
} from 'lucide-react'

interface Application {
  id: string
  email: string
  fullName: string
  mobileNumber: string
  idCardUrl: string | null
  approvalStatus: 'pending' | 'approved' | 'rejected'
  rejectionReason: string | null
  role: string
  city: string
  createdAt: string
  isSuperAdmin: boolean
}

export default function ApprovalsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [inspectImageModal, setInspectImageModal] = useState<string | null>(null)

  // Approval modal state
  const [approveModalApp, setApproveModalApp] = useState<Application | null>(null)
  const [assignedRole, setAssignedRole] = useState<'moderator' | 'volunteer' | 'content_editor'>('moderator')

  // Rejection modal state
  const [rejectModalApp, setRejectModalApp] = useState<Application | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Fetch applications
  const { data, isLoading, refetch } = useQuery<{ success: boolean; applications: Application[] }>({
    queryKey: ['staff-approvals'],
    queryFn: async () => {
      const res = await fetch('/api/admin/approvals')
      if (!res.ok) throw new Error('Failed to fetch applications')
      return res.json()
    },
  })

  // Mutation for Approve/Reject
  const actionMutation = useMutation({
    mutationFn: async ({
      action,
      userId,
      role,
      reason,
    }: {
      action: 'approve' | 'reject' | 'delete'
      userId: string
      role?: string
      reason?: string
    }) => {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId, assignedRole: role, reason }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.message || 'Action failed')
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-approvals'] })
      setApproveModalApp(null)
      setRejectModalApp(null)
      setRejectionReason('')
    },
  })

  const applications = data?.applications || []

  // Counts
  const pendingCount = applications.filter((a) => a.approvalStatus === 'pending' && !a.isSuperAdmin).length
  const approvedCount = applications.filter((a) => a.approvalStatus === 'approved' && !a.isSuperAdmin).length
  const rejectedCount = applications.filter((a) => a.approvalStatus === 'rejected').length

  // Filtered list
  const filteredApps = applications.filter((app) => {
    if (app.isSuperAdmin) return false
    const matchesTab = app.approvalStatus === activeTab
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      app.fullName.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.mobileNumber.includes(q) ||
      app.city.toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Staff & Volunteer Approvals</h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
              Super Admin Control
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Verify official company ID cards and grant dashboard operational privileges to applicant staff
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg border border-zinc-200/80 dark:border-zinc-700/60 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
        >
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Metric Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 shadow-2xs'
              : 'bg-white dark:bg-[#111113] border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Pending Review</span>
            <Clock className={`w-4 h-4 ${activeTab === 'pending' ? 'text-amber-500 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{pendingCount}</div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">Requires ID verification</p>
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'approved'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/60 shadow-2xs'
              : 'bg-white dark:bg-[#111113] border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Active Staff</span>
            <UserCheck className={`w-4 h-4 ${activeTab === 'approved' ? 'text-emerald-500 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{approvedCount}</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Verified & active</p>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'rejected'
              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-700/60 shadow-2xs'
              : 'bg-white dark:bg-[#111113] border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Rejected Applications</span>
            <UserX className={`w-4 h-4 ${activeTab === 'rejected' ? 'text-rose-500 dark:text-rose-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{rejectedCount}</div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">Denied login access</p>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, email, phone (+91), or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-2xs"
        />
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-xl">
          <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-xl space-y-2.5">
          <ShieldCheck className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            {activeTab === 'pending'
              ? 'No pending staff applications'
              : activeTab === 'approved'
              ? 'No active staff appointed yet'
              : 'No rejected staff applications'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            {activeTab === 'pending'
              ? 'When volunteers or moderators register through the staff portal, their applications and company ID photos will appear here for Super Admin verification.'
              : activeTab === 'approved'
              ? 'Currently no staff appointed. Verified volunteers and staff members who have access to manage property listings and local gems will appear here.'
              : 'No rejected staff applications found in records.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl p-4.5 shadow-2xs flex flex-col justify-between space-y-3.5 transition-all"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white text-sm leading-tight">{app.fullName}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="truncate max-w-[180px]">{app.email}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                      app.approvalStatus === 'pending'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40'
                        : app.approvalStatus === 'approved'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40'
                    }`}
                  >
                    {app.approvalStatus === 'pending' ? 'Pending' : app.approvalStatus === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg space-y-1.5 text-xs border border-zinc-100 dark:border-zinc-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" /> Mobile:
                    </span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">+91 {app.mobileNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" /> City:
                    </span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{app.city}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-zinc-400" /> {app.approvalStatus === 'approved' ? 'Assigned Role:' : 'Role Status:'}
                    </span>
                    <span className="font-medium text-indigo-600 dark:text-indigo-400 capitalize">
                      {app.approvalStatus === 'approved'
                        ? app.role === 'moderator'
                          ? 'Community & Housing Moderator'
                          : app.role === 'content_editor'
                          ? 'Content & Guide Editor'
                          : 'City Field Volunteer'
                        : 'To be assigned on approval'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Applied:
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {new Date(app.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Rejection reason if present */}
                {app.rejectionReason && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 rounded-lg text-xs text-rose-600 dark:text-rose-400">
                    <strong>Rejection Reason:</strong> {app.rejectionReason}
                  </div>
                )}

                {/* Company ID Card Preview */}
                <div>
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1.5">Company ID Document:</span>
                  {app.idCardUrl ? (
                    <div
                      onClick={() => setInspectImageModal(app.idCardUrl)}
                      className="w-full h-28 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 relative group cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={app.idCardUrl}
                        alt="Company ID Card"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-medium text-white transition-opacity">
                        <Eye className="w-4 h-4" />
                        <span>Inspect Photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-20 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                      No ID photo uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2">
                {app.approvalStatus === 'pending' ? (
                  <>
                    <button
                      onClick={() => {
                        setApproveModalApp(app)
                        setAssignedRole((app.role as any) || 'moderator')
                      }}
                      className="flex-1 py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setRejectModalApp(app)
                      }}
                      className="flex-1 py-1.5 px-3 bg-zinc-100 hover:bg-rose-50 dark:bg-zinc-800 dark:hover:bg-rose-950/40 text-zinc-700 hover:text-rose-600 dark:text-zinc-300 dark:hover:text-rose-400 font-medium text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-rose-200 dark:hover:border-rose-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                ) : app.approvalStatus === 'approved' ? (
                  <button
                    onClick={() => setRejectModalApp(app)}
                    className="w-full py-1.5 px-3 bg-zinc-100 hover:bg-rose-50 dark:bg-zinc-800 dark:hover:bg-rose-950/40 text-zinc-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Revoke Access</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => {
                        setApproveModalApp(app)
                        setAssignedRole('moderator')
                      }}
                      className="flex-1 py-1.5 px-3 bg-zinc-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-emerald-950/40 text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Re-evaluate</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Permanently delete applicant account ${app.fullName} (${app.email}) from database?`)) {
                          actionMutation.mutate({ action: 'delete', userId: app.id })
                        }
                      }}
                      disabled={actionMutation.isPending}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-700/60 transition-colors cursor-pointer"
                      title="Permanently delete account from database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX MODAL: Inspect ID Card */}
      {inspectImageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl max-w-2xl w-full p-5 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Official ID Card Inspection</h3>
              <button
                onClick={() => setInspectImageModal(null)}
                className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-full h-96 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={inspectImageModal}
                alt="ID Card"
                className="max-w-full max-h-full object-contain select-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <a
                href={inspectImageModal}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <span>Open Raw Image</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setInspectImageModal(null)}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors"
              >
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE MODAL */}
      {approveModalApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Approve Application</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Grant dashboard access to {approveModalApp.fullName}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Assign Operational Role</label>
              <select
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="moderator">Community & Housing Moderator</option>
                <option value="volunteer">City Field Volunteer</option>
                <option value="content_editor">Content & Local Guide Editor</option>
              </select>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                An automated approval notification will be dispatched to <strong className="text-zinc-800 dark:text-zinc-200">{approveModalApp.email}</strong> via Brevo.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
              <button
                onClick={() => setApproveModalApp(null)}
                disabled={actionMutation.isPending}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  actionMutation.mutate({
                    action: 'approve',
                    userId: approveModalApp.id,
                    role: assignedRole,
                  })
                }
                disabled={actionMutation.isPending}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                {actionMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm Approval</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-center flex-shrink-0">
                <UserX className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Reject Application</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Deny dashboard privileges for {rejectModalApp.fullName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Reason for Rejection</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Uploaded company ID card is blurred or expired. Please re-register with valid identification."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 placeholder-zinc-400"
              />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                This explanation will be emailed to <strong className="text-zinc-800 dark:text-zinc-200">{rejectModalApp.email}</strong> via Brevo.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
              <button
                onClick={() => setRejectModalApp(null)}
                disabled={actionMutation.isPending}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  actionMutation.mutate({
                    action: 'reject',
                    userId: rejectModalApp.id,
                    reason: rejectionReason,
                  })
                }
                disabled={actionMutation.isPending || !rejectionReason.trim()}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors disabled:opacity-50"
              >
                {actionMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Send Rejection Notice</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
