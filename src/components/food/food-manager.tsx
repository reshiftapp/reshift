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
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg shadow-black/20">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants by name, location, or cuisine..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5B6FD0]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#5B6FD0]"
          >
            <option value="All">All Price Ranges</option>
            <option value="₹">₹ (Budget)</option>
            <option value="₹₹">₹₹ (Moderate)</option>
            <option value="₹₹₹">₹₹₹ (Premium)</option>
          </select>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Food Spot</span>
          </button>
        </div>
      </div>

      {/* Grid of Food Spots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length > 0 ? (
          filtered.map((spot) => (
            <div
              key={spot.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between shadow-lg shadow-black/20 hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{spot.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#5B6FD0]" />
                      <span>{spot.location}, {spot.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{spot.rating ? spot.rating.toFixed(1) : '4.5'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                    {spot.cuisine || 'Cuisine'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                    {spot.price_range || '₹₹'}
                  </span>
                  {spot.distance_km && (
                    <span className="text-[11px] text-slate-500">
                      • {spot.distance_km} km away
                    </span>
                  )}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleToggleAvailable(spot.id, spot.is_available_now)}
                  disabled={isPending}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    spot.is_available_now
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${spot.is_available_now ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  <span>{spot.is_available_now ? 'Open Now' : 'Closed'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(spot)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Edit Food Spot"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(spot.id, spot.name)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                    title="Delete Food Spot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-16 text-center text-sm text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
            <UtensilsCrossed className="w-10 h-10 mx-auto text-slate-700 mb-2" />
            <div>No restaurants or food spots listed yet for this filter.</div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] text-white hover:bg-indigo-500"
            >
              <Plus className="w-4 h-4" />
              <span>List First Food Spot</span>
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingSpot ? 'Edit Food Spot' : 'Add New Restaurant / Café'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Place / Restaurant Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Paragon Restaurant"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
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
                  <label className="text-xs font-semibold text-slate-300">Price Range</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  >
                    <option value="₹">₹ (Budget / Under ₹150)</option>
                    <option value="₹₹">₹₹ (Moderate / ₹150 - ₹500)</option>
                    <option value="₹₹₹">₹₹₹ (Premium / ₹500+)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Location / Neighbourhood</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Fort Kochi, near Beach Walk"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Cuisine Tags</label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="e.g. Kerala, Seafood, North Indian, Café"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Rating (0-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#5B6FD0]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Available / Open Now</span>
                  <span className="text-[11px] text-slate-400">Shows green active status in mobile app</span>
                </div>
                <input
                  type="checkbox"
                  checked={isAvailableNow}
                  onChange={(e) => setIsAvailableNow(e.target.checked)}
                  className="w-4 h-4 accent-[#5B6FD0]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#5B6FD0] hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
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
