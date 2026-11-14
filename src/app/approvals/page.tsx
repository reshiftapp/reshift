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
      action: 'approve' | 'reject'
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Staff & Volunteer Approvals</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Super Admin Control
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Verify official company ID cards and grant dashboard operational privileges to applicant staff
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Metric Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Pending Review</span>
            <Clock className={`w-4 h-4 ${activeTab === 'pending' ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className="text-2xl font-bold text-white">{pendingCount}</div>
          <p className="text-[11px] text-amber-400/80 mt-1">Requires ID verification</p>
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'approved'
              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Active Staff</span>
            <UserCheck className={`w-4 h-4 ${activeTab === 'approved' ? 'text-emerald-400' : 'text-slate-500'}`} />
          </div>
          <div className="text-2xl font-bold text-white">{approvedCount}</div>
          <p className="text-[11px] text-emerald-400/80 mt-1">Verified & active</p>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'rejected'
              ? 'bg-red-500/10 border-red-500/40 shadow-lg shadow-red-500/10'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Rejected Applications</span>
            <UserX className={`w-4 h-4 ${activeTab === 'rejected' ? 'text-red-400' : 'text-slate-500'}`} />
          </div>
          <div className="text-2xl font-bold text-white">{rejectedCount}</div>
          <p className="text-[11px] text-red-400/80 mt-1">Denied login access</p>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, email, phone (+91), or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No applications in this category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'All volunteer and staff applications have been reviewed.'
              : 'No records matching the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white text-base leading-tight">{app.fullName}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate max-w-[180px]">{app.email}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      app.approvalStatus === 'pending'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : app.approvalStatus === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-red-500/10 text-red-300 border-red-500/30'
                    }`}
                  >
                    {app.approvalStatus === 'pending' ? 'Pending' : app.approvalStatus === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="p-3 bg-slate-850 rounded-xl space-y-2 text-xs border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile:
                    </span>
                    <span className="font-medium text-slate-200">+91 {app.mobileNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> City:
                    </span>
                    <span className="font-medium text-slate-200">{app.city}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-slate-400" /> Assigned / Req:
                    </span>
                    <span className="font-medium text-indigo-400 capitalize">{app.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Applied:
                    </span>
                    <span className="text-slate-400 text-[11px]">
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
                  <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-300">
                    <strong>Rejection Reason:</strong> {app.rejectionReason}
                  </div>
                )}

                {/* Company ID Card Preview */}
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-1.5">Company ID Document:</span>
                  {app.idCardUrl ? (
                    <div
                      onClick={() => setInspectImageModal(app.idCardUrl)}
                      className="w-full h-28 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative group cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={app.idCardUrl}
                        alt="Company ID Card"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-semibold text-white transition-opacity">
                        <Eye className="w-4 h-4" />
                        <span>Inspect Full Photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-20 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-center text-xs text-slate-500">
                      No ID photo uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                {app.approvalStatus === 'pending' ? (
                  <>
                    <button
                      onClick={() => {
                        setApproveModalApp(app)
                        setAssignedRole((app.role as any) || 'moderator')
                      }}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setRejectModalApp(app)
                      }}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 font-medium text-xs rounded-xl border border-slate-700 hover:border-red-500/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                ) : app.approvalStatus === 'approved' ? (
                  <button
                    onClick={() => setRejectModalApp(app)}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 text-xs rounded-xl border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Revoke Access</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setApproveModalApp(app)
                      setAssignedRole('moderator')
                    }}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 text-xs rounded-xl border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Re-evaluate & Approve</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX MODAL: Inspect ID Card */}
      {inspectImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Official ID Card Inspection</h3>
              <button
                onClick={() => setInspectImageModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full h-96 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={inspectImageModal}
                alt="ID Card"
                className="max-w-full max-h-full object-contain select-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <a
                href={inspectImageModal}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2"
              >
                <span>Open Raw Image</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setInspectImageModal(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE MODAL */}
      {approveModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Approve Application</h3>
                <p className="text-xs text-slate-400">Grant dashboard access to {approveModalApp.fullName}</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">Assign Operational Role</label>
              <select
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="moderator">Community & Housing Moderator</option>
                <option value="volunteer">City Field Volunteer</option>
                <option value="content_editor">Content & Local Guide Editor</option>
              </select>
              <p className="text-[11px] text-slate-500">
                An automated approval notification will be dispatched to <strong className="text-slate-300">{approveModalApp.email}</strong> via Brevo.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setApproveModalApp(null)}
                disabled={actionMutation.isPending}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 cursor-pointer"
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
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Reject Application</h3>
                <p className="text-xs text-slate-400">Deny dashboard privileges for {rejectModalApp.fullName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">Reason for Rejection</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Uploaded company ID card is blurred or expired. Please re-register with valid identification."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-slate-500"
              />
              <p className="text-[11px] text-slate-500">
                This explanation will be emailed to <strong className="text-slate-300">{rejectModalApp.email}</strong> via Brevo.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRejectModalApp(null)}
                disabled={actionMutation.isPending}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 cursor-pointer"
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
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/30 disabled:opacity-50"
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
