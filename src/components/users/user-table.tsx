'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils'
import { 
  Search, 
  Download, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  ExternalLink,
  ChevronRight,
  Filter,
  Lock
} from 'lucide-react'
import Papa from 'papaparse'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

interface UserTableProps {
  users: ProfileRow[]
}

export function UserTable({ users }: UserTableProps) {
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Filter users based on search and dropdown selections
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const isSuperAdmin = u.email === 'reshiftapp@gmail.com' || u.moderator_role === 'super_admin'
      const effectiveRole = isSuperAdmin ? 'Super Admin' : (u.role || 'Other')

      const matchSearch =
        search === '' ||
        (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())

      const matchCity = cityFilter === 'All' || u.city === cityFilter
      const matchRole = roleFilter === 'All' || effectiveRole === roleFilter || u.role === roleFilter
      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && !u.is_suspended) ||
        (statusFilter === 'Suspended' && u.is_suspended)

      return matchSearch && matchCity && matchRole && matchStatus
    })
  }, [users, search, cityFilter, roleFilter, statusFilter])

  // Export to CSV
  const exportCsv = () => {
    const csvData = filteredUsers.map((u) => {
      const isSuperAdmin = u.email === 'reshiftapp@gmail.com' || u.moderator_role === 'super_admin'
      return {
        ID: u.id,
        FullName: u.full_name || 'N/A',
        Email: u.email,
        Role: isSuperAdmin ? 'Super Admin' : (u.role || 'Other'),
        City: u.city || 'N/A',
        ModeratorRole: isSuperAdmin ? 'super_admin' : (u.moderator_role || 'user'),
        Status: u.is_suspended ? 'Suspended' : 'Active',
        SuspensionReason: u.suspension_reason || '',
        JoinedDate: u.created_at,
      }
    })

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reshift-users-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-3.5 rounded-xl shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by full name or email address..."
            className="w-full pl-8.5 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Cities</option>
            <option value="Kochi">Kochi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Trivandrum">Trivandrum</option>
            <option value="Calicut">Calicut</option>
            <option value="Chennai">Chennai</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Student">Student</option>
            <option value="Working Professional">Working Professional</option>
            <option value="Other">Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/60 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Export CSV ({filteredUsers.length})</span>
          </button>
        </div>
      </div>

      {/* User Records Data Table */}
      <div className="rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Joined Date</th>
                <th className="px-5 py-3">Account Status</th>
                <th className="px-5 py-3">Access Role</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/60">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isSuperAdminUser = u.email === 'reshiftapp@gmail.com' || u.moderator_role === 'super_admin'
                  const initials = isSuperAdminUser ? 'RA' : (u.full_name || u.email || 'U').slice(0, 2).toUpperCase()
                  const displayName = isSuperAdminUser ? 'ReShift Super Admin' : (u.full_name || 'Anonymous User')

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors group"
                    >
                      {/* Avatar & Name */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shadow-2xs ${
                              isSuperAdminUser
                                ? 'bg-indigo-600 text-white'
                                : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                            }`}>
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-zinc-900 dark:text-white flex items-center gap-1.5">
                              <span>{displayName}</span>
                              {isSuperAdminUser && (
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Demographic / System Role */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {isSuperAdminUser ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                            <ShieldCheck className="w-3 h-3" /> Super Admin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60 text-[11px] font-medium">
                            {u.role || 'Other'}
                          </span>
                        )}
                      </td>

                      {/* City */}
                      <td className="px-5 py-3.5 whitespace-nowrap font-medium text-zinc-700 dark:text-zinc-300">
                        {isSuperAdminUser ? 'All (Global)' : (u.city || '—')}
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                        {formatDate(u.created_at)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {u.is_suspended && !isSuperAdminUser ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                            <ShieldAlert className="w-3 h-3" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                            <UserCheck className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>

                      {/* Access Role */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {isSuperAdminUser ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                            <ShieldCheck className="w-3 h-3" /> Super Admin (Root)
                          </span>
                        ) : u.moderator_role ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 capitalize">
                            <ShieldCheck className="w-3 h-3" /> {u.moderator_role.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 text-[11px] font-medium border border-zinc-200/60 dark:border-zinc-700/60">
                            📱 App Customer
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        {isSuperAdminUser ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100/80 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 select-none cursor-default"
                            title="Super Admin access is permanent and cannot be modified or revoked"
                          >
                            <Lock className="w-3 h-3 text-zinc-400" />
                            <span>Immutable Root</span>
                          </span>
                        ) : (
                          <Link
                            href={`/users/${u.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                          >
                            <span>Manage</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    No matching users found for this filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
