'use client'

import React, { useState, useTransition, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { formatCurrency } from '@/lib/utils'
import {
  togglePropertyActive,
  togglePropertyVerified,
  deleteProperty,
  bulkInsertProperties,
} from '@/app/housing/actions'
import {
  Home,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Edit,
  Download,
  Upload,
  Star,
  MapPin,
  Building,
} from 'lucide-react'
import Papa from 'papaparse'

type PropertyRow = Database['public']['Tables']['properties']['Row']

interface HousingTableProps {
  properties: PropertyRow[]
}

export function HousingTable({ properties }: HousingTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('All')
  const [forWhomFilter, setForWhomFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Filter properties
  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchSearch =
        search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())

      const matchCity = cityFilter === 'All' || p.city === cityFilter
      const matchForWhom = forWhomFilter === 'All' || p.for_whom === forWhomFilter
      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && p.is_active) ||
        (statusFilter === 'Inactive' && !p.is_active)

      return matchSearch && matchCity && matchForWhom && matchStatus
    })
  }, [properties, search, cityFilter, forWhomFilter, statusFilter])

  const handleToggleActive = (id: string, current: boolean) => {
    startTransition(async () => {
      await togglePropertyActive(id, !current)
      router.refresh()
    })
  }

  const handleToggleVerified = (id: string, current: boolean) => {
    startTransition(async () => {
      await togglePropertyVerified(id, !current)
      router.refresh()
    })
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return
    startTransition(async () => {
      await deleteProperty(id)
      router.refresh()
    })
  }

  // Export CSV
  const handleExportCsv = () => {
    const data = filtered.map((p) => ({
      ID: p.id,
      Name: p.name,
      City: p.city,
      Location: p.location,
      ForWhom: p.for_whom,
      MonthlyRent: p.monthly_rent,
      Rating: p.rating || 0,
      IsVerified: p.is_verified,
      IsActive: p.is_active,
      DistanceKm: p.distance_km || 0,
      Amenities: (p.amenities || []).join('; '),
      ImageUrl: p.image_url || '',
    }))

    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reshift-properties-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Bulk Import CSV
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows: any[] = results.data.map((r: any) => ({
            name: r.Name || r.name,
            city: r.City || r.city || 'Kochi',
            location: r.Location || r.location || '',
            for_whom: r.ForWhom || r.for_whom || 'Any',
            monthly_rent: Number(r.MonthlyRent || r.monthly_rent || 0),
            rating: Number(r.Rating || r.rating || 4.5),
            is_verified: r.IsVerified === 'true' || r.is_verified === 'true',
            is_active: r.IsActive !== 'false' && r.is_active !== 'false',
            distance_km: Number(r.DistanceKm || r.distance_km || 1.0),
            amenities: (r.Amenities || r.amenities || '').split(';').map((s: string) => s.trim()).filter(Boolean),
            image_url: r.ImageUrl || r.image_url || null,
          }))

          if (rows.length === 0) {
            alert('No valid property rows found in CSV.')
            return
          }

          startTransition(async () => {
            const res = await bulkInsertProperties(rows)
            if (res.success) {
              alert(`Successfully imported ${res.count} properties into Supabase!`)
              router.refresh()
            } else {
              alert(`Failed to import: ${res.error}`)
            }
          })
        } catch (err: any) {
          alert(`CSV parsing error: ${err.message}`)
        }
      },
    })
  }

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg shadow-black/20">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PG or rental by name or location..."
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

          {/* Gender / For Whom Filter */}
          <select
            value={forWhomFilter}
            onChange={(e) => setForWhomFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#5B6FD0]"
          >
            <option value="All">All Tenants</option>
            <option value="Girls">Girls Only</option>
            <option value="Boys">Boys Only</option>
            <option value="Any">Any / Unisex</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#5B6FD0]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>CSV</span>
          </button>

          {/* Import CSV */}
          <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCsv}
              className="hidden"
            />
          </label>

          {/* Add Property Button */}
          <Link
            href="/housing/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Property Data Grid */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Property</th>
                <th className="px-6 py-3.5">Tenancy</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Rent / Month</th>
                <th className="px-6 py-3.5">Rating</th>
                <th className="px-6 py-3.5">Verified</th>
                <th className="px-6 py-3.5">Live Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Thumbnail & Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0">
                            <Home className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#5B6FD0]" /> {p.city}
                            {p.distance_km && (
                              <span className="text-[11px] text-slate-500">
                                • {p.distance_km} km from centre
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tenancy / For Whom */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                        {p.for_whom}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-300">
                      {p.location}
                    </td>

                    {/* Rent */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-white">
                      {formatCurrency(p.monthly_rent)}
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <div className="flex items-center gap-1 font-semibold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{p.rating ? p.rating.toFixed(1) : '—'}</span>
                      </div>
                    </td>

                    {/* Verified Badge Toggle */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <button
                        onClick={() => handleToggleVerified(p.id, p.is_verified)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                          p.is_verified
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>{p.is_verified ? 'Verified' : 'Unverified'}</span>
                      </button>
                    </td>

                    {/* Active Switch Toggle */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <button
                        onClick={() => handleToggleActive(p.id, p.is_active)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                          p.is_active
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-indigo-400 animate-pulse' : 'bg-rose-400'}`} />
                        <span>{p.is_active ? 'Active on App' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/housing/${p.id}`}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Edit Property"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={isPending}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                          title="Delete Property"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-sm text-slate-500">
                    <Building className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                    <div>No properties listed yet matching your filters.</div>
                    <Link
                      href="/housing/new"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] text-white hover:bg-indigo-500"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add the first property</span>
                    </Link>
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
