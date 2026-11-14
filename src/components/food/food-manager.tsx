'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import {
  createFoodSpot,
  updateFoodSpot,
  toggleFoodAvailable,
  deleteFoodSpot,
} from '@/app/food/actions'
import {
  UtensilsCrossed,
  Plus,
  Search,
  Star,
  MapPin,
  Trash2,
  Edit,
  DollarSign,
  X,
  CheckCircle2,
  Clock
} from 'lucide-react'

type FoodSpotRow = Database['public']['Tables']['food_spots']['Row']

interface FoodManagerProps {
  foodSpots: FoodSpotRow[]
}

export function FoodManager({ foodSpots }: FoodManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('All')
  const [priceFilter, setPriceFilter] = useState('All')

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSpot, setEditingSpot] = useState<FoodSpotRow | null>(null)

  // Form Fields
  const [name, setName] = useState('')
  const [city, setCity] = useState('Kochi')
  const [location, setLocation] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [priceRange, setPriceRange] = useState('₹₹')
  const [distanceKm, setDistanceKm] = useState(1.2)
  const [rating, setRating] = useState(4.5)
  const [isAvailableNow, setIsAvailableNow] = useState(true)
  const [latitude, setLatitude] = useState(9.9312)
  const [longitude, setLongitude] = useState(76.2673)

  const filtered = useMemo(() => {
    return foodSpots.filter((s) => {
      const matchSearch =
        search === '' ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.location.toLowerCase().includes(search.toLowerCase()) ||
        (s.cuisine || '').toLowerCase().includes(search.toLowerCase())

      const matchCity = cityFilter === 'All' || s.city === cityFilter
      const matchPrice = priceFilter === 'All' || s.price_range === priceFilter

      return matchSearch && matchCity && matchPrice
    })
  }, [foodSpots, search, cityFilter, priceFilter])

  const openCreateModal = () => {
    setEditingSpot(null)
    setName('')
    setCity('Kochi')
    setLocation('')
    setCuisine('Kerala, South Indian')
    setPriceRange('₹₹')
    setDistanceKm(1.2)
    setRating(4.5)
    setIsAvailableNow(true)
    setLatitude(9.9312)
    setLongitude(76.2673)
    setModalOpen(true)
  }

  const openEditModal = (spot: FoodSpotRow) => {
    setEditingSpot(spot)
    setName(spot.name)
    setCity(spot.city)
    setLocation(spot.location)
    setCuisine(spot.cuisine || '')
    setPriceRange(spot.price_range || '₹₹')
    setDistanceKm(spot.distance_km || 1.0)
    setRating(spot.rating || 4.5)
    setIsAvailableNow(spot.is_available_now)
    setLatitude(spot.latitude || 9.9312)
    setLongitude(spot.longitude || 76.2673)
    setModalOpen(true)
  }

  const handleToggleAvailable = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleFoodAvailable(id, !current)
      router.refresh()
    })
  }

  const handleDelete = (id: string, spotName: string) => {
    if (!confirm(`Delete restaurant "${spotName}"?`)) return
    startTransition(async () => {
      await deleteFoodSpot(id)
      router.refresh()
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const payload = {
        name,
        city,
        location,
        cuisine,
        price_range: priceRange,
        distance_km: Number(distanceKm),
        rating: Number(rating),
        is_available_now: isAvailableNow,
        latitude: Number(latitude),
        longitude: Number(longitude),
      }

      if (editingSpot) {
        await updateFoodSpot(editingSpot.id, payload)
      } else {
        await createFoodSpot(payload)
      }
      setModalOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-3.5 rounded-xl shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants by name, location, or cuisine..."
            className="w-full pl-8.5 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Price Ranges</option>
            <option value="₹">₹ (Budget)</option>
            <option value="₹₹">₹₹ (Moderate)</option>
            <option value="₹₹₹">₹₹₹ (Premium)</option>
          </select>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Food Spot</span>
          </button>
        </div>
      </div>

      {/* Grid of Food Spots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((spot) => (
            <div
              key={spot.id}
              className="rounded-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-4.5 flex flex-col justify-between shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white text-sm leading-snug">{spot.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{spot.location}, {spot.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/40 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400" />
                    <span>{spot.rating ? spot.rating.toFixed(1) : '4.5'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 text-[11px] font-medium border border-zinc-200/60 dark:border-zinc-700/60">
                    {spot.cuisine || 'Cuisine'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200/60 dark:border-emerald-800/40">
                    {spot.price_range || '₹₹'}
                  </span>
                  {spot.distance_km && (
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      • {spot.distance_km} km away
                    </span>
                  )}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleToggleAvailable(spot.id, spot.is_available_now)}
                  disabled={isPending}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border transition-all cursor-pointer ${
                    spot.is_available_now
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${spot.is_available_now ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-rose-500 dark:bg-rose-400'}`} />
                  <span>{spot.is_available_now ? 'Open Now' : 'Closed'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(spot)}
                    className="p-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                    title="Edit Food Spot"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(spot.id, spot.name)}
                    disabled={isPending}
                    className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 transition-colors cursor-pointer"
                    title="Delete Food Spot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-[#111113] rounded-xl border border-zinc-200 dark:border-white/10">
            <UtensilsCrossed className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
            <div>No restaurants or food spots listed yet for this filter.</div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List First Food Spot</span>
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {editingSpot ? 'Edit Food Spot' : 'Add New Restaurant / Café'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex items-center justify-center cursor-pointer transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Place / Restaurant Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Paragon Restaurant"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Kochi">Kochi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Trivandrum">Trivandrum</option>
                    <option value="Calicut">Calicut</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Price Range</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="₹">₹ (Budget / Under ₹150)</option>
                    <option value="₹₹">₹₹ (Moderate / ₹150 - ₹500)</option>
                    <option value="₹₹₹">₹₹₹ (Premium / ₹500+)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Location / Neighbourhood</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Fort Kochi, near Beach Walk"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Cuisine Tags</label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="e.g. Kerala, Seafood, North Indian, Café"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Rating (0-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-zinc-900 dark:text-white block">Available / Open Now</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Shows green active status in mobile app</span>
                </div>
                <input
                  type="checkbox"
                  checked={isAvailableNow}
                  onChange={(e) => setIsAvailableNow(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-2xs cursor-pointer transition-colors"
                >
                  {isPending ? 'Saving...' : editingSpot ? 'Save Changes' : 'Add Food Spot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
