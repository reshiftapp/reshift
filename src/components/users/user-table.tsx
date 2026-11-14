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
  Filter
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
      const matchSearch =
        search === '' ||
        (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())

      const matchCity = cityFilter === 'All' || u.city === cityFilter
      const matchRole = roleFilter === 'All' || u.role === roleFilter
      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && !u.is_suspended) ||
        (statusFilter === 'Suspended' && u.is_suspended)

      return matchSearch && matchCity && matchRole && matchStatus
    })
  }, [users, search, cityFilter, roleFilter, statusFilter])

  // Export to CSV
  const exportCsv = () => {
    const csvData = filteredUsers.map((u) => ({
      ID: u.id,
      FullName: u.full_name || 'N/A',
      Email: u.email,
      Role: u.role || 'Other',
      City: u.city || 'N/A',
      ModeratorRole: u.moderator_role || 'user',
      Status: u.is_suspended ? 'Suspended' : 'Active',
      SuspensionReason: u.suspension_reason || '',
      JoinedDate: u.created_at,
    }))

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
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg shadow-black/20">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by full name or email address..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5B6FD0]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#5B6FD0]"
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
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#5B6FD0]"
          >
            <option value="All">All Roles</option>
            <option value="Student">Student</option>
            <option value="Working Professional">Working Professional</option>
            <option value="Other">Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#5B6FD0]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV ({filteredUsers.length})</span>
          </button>
        </div>
      </div>

      {/* User Records Data Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">City</th>
                <th className="px-6 py-3.5">Joined Date</th>
                <th className="px-6 py-3.5">Account Status</th>
                <th className="px-6 py-3.5">Access Role</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const initials = (u.full_name || u.email || 'U').slice(0, 2).toUpperCase()
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Avatar & Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/users/${u.id}`} className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5B6FD0] to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                              {u.full_name || 'Anonymous User'}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                          </div>
                        </Link>
                      </td>

                      {/* Demographic Role */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700/80 font-medium">
                          {u.role || 'Other'}
                        </span>
                      </td>

                      {/* City */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-300">
                        {u.city || '—'}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        {formatDate(u.created_at)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        {u.is_suspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <ShieldAlert className="w-3 h-3" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <UserCheck className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>

                      {/* Moderator Role */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        {u.moderator_role ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                            <ShieldCheck className="w-3 h-3" /> {u.moderator_role.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">Standard User</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <Link
                          href={`/users/${u.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-[#5B6FD0] font-medium border border-indigo-500/20 transition-colors"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
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
