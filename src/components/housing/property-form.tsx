'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { createProperty, updateProperty } from '@/app/housing/actions'
import { ImageUploader } from '@/components/shared/image-uploader'
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Star, 
  CheckCircle, 
  Radio, 
  Save, 
  ArrowLeft 
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
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(initialData?.name || '')
  const [city, setCity] = useState(initialData?.city || 'Kochi')
  const [location, setLocation] = useState(initialData?.location || '')
  const [forWhom, setForWhom] = useState(initialData?.for_whom || 'Girls')
  const [monthlyRent, setMonthlyRent] = useState(initialData?.monthly_rent || 6500)
  const [distanceKm, setDistanceKm] = useState(initialData?.distance_km || 1.5)
  const [rating, setRating] = useState(initialData?.rating || 4.5)
  const [isVerified, setIsVerified] = useState(initialData?.is_verified ?? true)
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
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/housing"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {initialData ? `Edit Property: ${initialData.name}` : 'List New Property / PG'}
            </h1>
            <p className="text-xs text-slate-400">
              Live updates directly sync to the Reshift mobile app find home catalog.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isPending ? 'Saving to Database...' : initialData ? 'Update Property' : 'Publish Property'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Core Details */}
        <div className="space-y-4 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl shadow-black/20">
          <h3 className="text-sm font-bold text-white mb-2">Basic Information</h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Property Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grace Luxury PG for Women"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5B6FD0]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
              >
                <option value="Kochi">Kochi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Trivandrum">Trivandrum</option>
                <option value="Calicut">Calicut</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tenant Target</label>
              <select
                value={forWhom}
                onChange={(e) => setForWhom(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
              >
                <option value="Girls">Girls Only</option>
                <option value="Boys">Boys Only</option>
                <option value="Any">Any / Unisex</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Neighbourhood / Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Edappally, near Metro Station"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5B6FD0]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Monthly Rent (₹)</label>
              <input
                type="number"
                min="0"
                step="500"
                required
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Distance (km)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Full Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5B6FD0]"
            />
          </div>
        </div>

        {/* Right Column: Image, Coordinates, Amenities, Toggles */}
        <div className="space-y-4">
          {/* Image Uploader to Supabase Storage */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl shadow-black/20">
            <h3 className="text-sm font-bold text-white mb-3">Primary Property Photo</h3>
            <ImageUploader
              bucket="property-images"
              currentUrl={imageUrl}
              onUploadComplete={(url) => setImageUrl(url)}
            />
          </div>

          {/* Coordinates & Rating */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl shadow-black/20 space-y-4">
            <h3 className="text-sm font-bold text-white">Geographic Pin & Rating</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Rating</span>
                <span className="text-amber-400 font-bold">{rating} / 5.0</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full accent-[#5B6FD0]"
              />
            </div>

            {/* Badges and Toggles */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Verified Badge</span>
                <span className="text-[11px] text-slate-500">Shows verified tick in Flutter app</span>
              </div>
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 accent-[#5B6FD0] cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Live Status (Active)</span>
                <span className="text-[11px] text-slate-500">Visible to users on mobile</span>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-[#5B6FD0] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Amenities Selection (Full Width) */}
        <div className="md:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl shadow-black/20">
          <h3 className="text-sm font-bold text-white mb-1">Amenities Included</h3>
          <p className="text-xs text-slate-400 mb-4">Click chips to toggle available facilities</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_AMENITIES.map((item) => {
              const selected = amenities.includes(item)
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleAmenity(item)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selected
                      ? 'bg-[#5B6FD0] text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
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
