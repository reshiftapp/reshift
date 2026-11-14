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
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-3.5 rounded-xl shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PG or rental by name or location..."
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

          {/* Gender / For Whom Filter */}
          <select
            value={forWhomFilter}
            onChange={(e) => setForWhomFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
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
            className="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/60 transition-colors shadow-2xs"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>CSV</span>
          </button>

          {/* Import CSV */}
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/60 transition-colors cursor-pointer shadow-2xs">
            <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Property Data Grid */}
      <div className="rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Property</th>
                <th className="px-5 py-3">Tenancy</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Rent / Month</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Verified</th>
                <th className="px-5 py-3">Live Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/60">
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors group">
                    {/* Thumbnail & Name */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 flex-shrink-0">
                            <Home className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> {p.city}
                            {p.distance_km && (
                              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                                • {p.distance_km} km
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tenancy / For Whom */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60 text-[11px] font-medium">
                        {p.for_whom}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      {p.location}
                    </td>

                    {/* Rent */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-zinc-900 dark:text-white">
                      {formatCurrency(p.monthly_rent)}
                    </td>

                    {/* Rating */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-medium text-amber-500 dark:text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400" />
                        <span>{p.rating ? p.rating.toFixed(1) : '—'}</span>
                      </div>
                    </td>

                    {/* Verified Badge Toggle */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleVerified(p.id, p.is_verified)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all cursor-pointer ${
                          p.is_verified
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40'
                            : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/60'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>{p.is_verified ? 'Verified' : 'Unverified'}</span>
                      </button>
                    </td>

                    {/* Active Switch Toggle */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(p.id, p.is_active)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all cursor-pointer ${
                          p.is_active
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/40'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-rose-500 dark:bg-rose-400'}`} />
                        <span>{p.is_active ? 'Active on App' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/housing/${p.id}`}
                          className="p-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                          title="Edit Property"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={isPending}
                          className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 transition-colors cursor-pointer"
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
                  <td colSpan={8} className="px-5 py-14 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    <Building className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                    <div>No properties listed yet matching your filters.</div>
                    <Link
                      href="/housing/new"
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
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
