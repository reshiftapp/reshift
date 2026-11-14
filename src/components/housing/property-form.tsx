'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { createProperty, updateProperty } from '@/app/housing/actions'
import { ImageUploader } from '@/components/shared/image-uploader'
import { useAuth } from '@/contexts/auth-context'
import { useCity } from '@/contexts/city-context'
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Star, 
  CheckCircle, 
  Radio, 
  Save, 
  ArrowLeft,
  Lock,
  ShieldCheck 
} from 'lucide-react'
import Link from 'next/link'

type PropertyRow = Database['public']['Tables']['properties']['Row']

interface PropertyFormProps {
  initialData?: PropertyRow
}

const AVAILABLE_AMENITIES = [
  'Wi-Fi',
  'AC',
  'Meals Included',
  'Laundry',
  'Attached Bathroom',
  'Power Backup',
  'RO Drinking Water',
  '24/7 Security',
  'CCTV Surveillance',
  'Biometric Access',
  'Gym',
  'Housekeeping',
]

export function PropertyForm({ initialData }: PropertyFormProps) {
  const router = useRouter()
  const { isSuperAdmin } = useAuth()
  const { cities } = useCity()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(initialData?.name || '')
  const [city, setCity] = useState(initialData?.city || 'Kochi')
  const [location, setLocation] = useState(initialData?.location || '')
  const [forWhom, setForWhom] = useState(initialData?.for_whom || 'Girls')
  const [monthlyRent, setMonthlyRent] = useState(initialData?.monthly_rent || (isSuperAdmin ? 6500 : 0))
  const [distanceKm, setDistanceKm] = useState(initialData?.distance_km || 1.5)
  const [rating, setRating] = useState(initialData?.rating || 4.5)
  const [isVerified, setIsVerified] = useState(initialData?.is_verified ?? isSuperAdmin)
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  const [description, setDescription] = useState(
    initialData?.description || 'Furnished PG accommodations with high-speed internet, meals, and modern amenities.'
  )
  const [amenities, setAmenities] = useState<string[]>(
    initialData?.amenities || ['Wi-Fi', 'Meals Included', 'Laundry']
  )
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')
  const [latitude, setLatitude] = useState(initialData?.latitude || 9.9312)
  const [longitude, setLongitude] = useState(initialData?.longitude || 76.2673)

  const toggleAmenity = (item: string) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter((a) => a !== item))
    } else {
      setAmenities([...amenities, item])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Property name is required')
      return
    }

    startTransition(async () => {
      const payload = {
        name,
        city,
        location,
        for_whom: forWhom,
        monthly_rent: Number(monthlyRent),
        distance_km: Number(distanceKm),
        rating: Number(rating),
        is_verified: isVerified,
        is_active: isActive,
        description,
        amenities,
        image_url: imageUrl || null,
        latitude: Number(latitude),
        longitude: Number(longitude),
      }

      if (initialData?.id) {
        const res = await updateProperty(initialData.id, payload)
        if (res.success) {
          router.push('/housing')
          router.refresh()
        } else {
          setError(res.error || 'Failed to update property')
        }
      } else {
        const res = await createProperty(payload)
        if (res.success) {
          router.push('/housing')
          router.refresh()
        } else {
          setError(res.error || 'Failed to create property')
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Link
            href="/housing"
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {initialData ? `Edit Property: ${initialData.name}` : 'List New Property / PG'}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Live updates directly sync to the ReShift mobile app find home catalog.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isPending ? 'Saving to Database...' : initialData ? 'Update Property' : 'Publish Property'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Core Details */}
        <div className="space-y-4 rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">Basic Information</h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Property Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grace Luxury PG for Women"
              className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                {cities.filter((c) => c.name !== 'All').map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.label} ({c.state})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Tenant Target</label>
              <select
                value={forWhom}
                onChange={(e) => setForWhom(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                <option value="Girls">Girls Only</option>
                <option value="Boys">Boys Only</option>
                <option value="Any">Any / Unisex</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Neighbourhood / Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Edappally, near Metro Station"
              className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Monthly Rent (₹)</label>
                {isSuperAdmin ? (
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
                    👑 Set by Super Admin
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500" /> Super Admin Only
                  </span>
                )}
              </div>
              {isSuperAdmin ? (
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  placeholder="e.g. 7500"
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              ) : (
                <div className="space-y-1">
                  <input
                    type="text"
                    disabled
                    value={initialData?.monthly_rent ? `₹${initialData.monthly_rent} / month` : 'Pending Super Admin Review'}
                    className="w-full px-3.5 py-2 bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-500 dark:text-zinc-400 cursor-not-allowed select-none"
                  />
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">
                    Staff listing: You can submit the property details. Official rent price is reviewed and assigned by Super Admin.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Distance (km)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Full Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Right Column: Image, Coordinates, Amenities, Toggles */}
        <div className="space-y-4">
          {/* Image Uploader to Supabase Storage */}
          <div className="rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Primary Property Photo</h3>
            <ImageUploader
              bucket="property-images"
              currentUrl={imageUrl}
              onUploadComplete={(url) => setImageUrl(url)}
            />
          </div>

          {/* Coordinates & Rating */}
          <div className="rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Geographic Pin & Rating</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <span>Rating</span>
                <span className="text-amber-500 dark:text-amber-400 font-bold">{rating} / 5.0</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Badges and Toggles */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 block">Verified Badge</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {isSuperAdmin ? 'Shows verified badge in Flutter app' : 'Verified by Super Admin upon review'}
                </span>
              </div>
              <input
                type="checkbox"
                disabled={!isSuperAdmin}
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer disabled:opacity-50"
              />
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 block">Live Status (Active)</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Visible to users on mobile</span>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Amenities Selection (Full Width) */}
        <div className="md:col-span-2 rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Amenities Included</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">Click chips to toggle available facilities</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_AMENITIES.map((item) => {
              const selected = amenities.includes(item)
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleAmenity(item)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    selected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xs'
                      : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {selected && '✓ '}
                  {item}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </form>
  )
}
