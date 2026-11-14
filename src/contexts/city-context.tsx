'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type City = string

export interface CityMetadata {
  id?: string
  name: string
  label: string
  state: string
  centerCoordinates: {
    lat: number
    lng: number
  }
}

export const DEFAULT_CITIES: CityMetadata[] = [
  { name: 'All', label: 'All Cities', state: 'Pan-India', centerCoordinates: { lat: 10.0, lng: 76.5 } },
  { name: 'Kochi', label: 'Kochi', state: 'Kerala', centerCoordinates: { lat: 9.9312, lng: 76.2673 } },
  { name: 'Bangalore', label: 'Bangalore', state: 'Karnataka', centerCoordinates: { lat: 12.9716, lng: 77.5946 } },
  { name: 'Trivandrum', label: 'Trivandrum', state: 'Kerala', centerCoordinates: { lat: 8.5241, lng: 76.9366 } },
  { name: 'Calicut', label: 'Calicut', state: 'Kerala', centerCoordinates: { lat: 11.2588, lng: 75.7804 } },
  { name: 'Chennai', label: 'Chennai', state: 'Tamil Nadu', centerCoordinates: { lat: 13.0827, lng: 80.2707 } },
  { name: 'Mumbai', label: 'Mumbai', state: 'Maharashtra', centerCoordinates: { lat: 19.076, lng: 72.8777 } },
]

interface CityContextType {
  city: City
  setCity: (city: City) => void
  cities: CityMetadata[]
  cityMetadata: CityMetadata
  addCity: (newCity: CityMetadata) => Promise<boolean>
  deleteCity: (cityName: string, cityId?: string) => Promise<boolean>
}

const CityContext = createContext<CityContextType | undefined>(undefined)

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<City>('Kochi')
  const [citiesList, setCitiesList] = useState<CityMetadata[]>(DEFAULT_CITIES)

  useEffect(() => {
    // 1. Fetch cities from database API
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.cities) && data.cities.length > 0) {
          setCitiesList(data.cities)
        }
      })
      .catch((err) => console.error('Failed to load cities from DB API:', err))

    // 2. Load active city from localStorage
    const saved = localStorage.getItem('reshift_active_city')
    if (saved) {
      setCityState(saved)
    }
  }, [])

  const setCity = (newCity: City) => {
    setCityState(newCity)
    localStorage.setItem('reshift_active_city', newCity)
    document.cookie = `reshift_city=${encodeURIComponent(newCity)}; path=/; max-age=31536000`
  }

  const addCity = async (newCity: CityMetadata): Promise<boolean> => {
    try {
      // 1. Persist to Database API
      const res = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCity.name,
          state: newCity.state,
          lat: newCity.centerCoordinates.lat,
          lng: newCity.centerCoordinates.lng,
        }),
      })

      const data = await res.json()
      if (!res.ok && !data.success) {
        throw new Error(data.message || 'Failed to save city to database')
      }

      const savedCity: CityMetadata = data.city || newCity

      // 2. Update reactive state
      setCitiesList((prev) => {
        if (prev.some((c) => c.name.toLowerCase() === savedCity.name.toLowerCase())) {
          return prev
        }
        const updated = [...prev, savedCity]
        const customOnly = updated.filter(
          (c) => !DEFAULT_CITIES.some((d) => d.name.toLowerCase() === c.name.toLowerCase())
        )
        localStorage.setItem('reshift_custom_cities', JSON.stringify(customOnly))
        return updated
      })

      return true
    } catch (err) {
      console.error('Error adding city:', err)
      return false
    }
  }

  const deleteCity = async (cityName: string, cityId?: string): Promise<boolean> => {
    if (cityName.toLowerCase() === 'all') return false

    try {
      // 1. Send permanent delete request to database API
      const url = `/api/cities?name=${encodeURIComponent(cityName)}${cityId ? `&id=${cityId}` : ''}`
      const res = await fetch(url, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok && !data.success) {
        throw new Error(data.message || 'Failed to delete city from database')
      }

      // 2. Remove from reactive state and client storage
      setCitiesList((prev) => {
        const updated = prev.filter((c) => c.name.toLowerCase() !== cityName.toLowerCase())
        const customOnly = updated.filter(
          (c) => !DEFAULT_CITIES.some((d) => d.name.toLowerCase() === c.name.toLowerCase())
        )
        localStorage.setItem('reshift_custom_cities', JSON.stringify(customOnly))
        return updated
      })

      // 3. If currently viewing the deleted city, reset active city to default 'Kochi'
      if (city.toLowerCase() === cityName.toLowerCase()) {
        setCity('Kochi')
      }

      return true
    } catch (err) {
      console.error('Error deleting city:', err)
      return false
    }
  }

  const cityMetadata =
    citiesList.find((c) => c.name.toLowerCase() === city.toLowerCase()) ||
    citiesList[1] ||
    DEFAULT_CITIES[1]

  return (
    <CityContext.Provider
      value={{
        city,
        setCity,
        cities: citiesList,
        cityMetadata,
        addCity,
        deleteCity,
      }}
    >
      {children}
    </CityContext.Provider>
  )
}

export function useCity() {
  const context = useContext(CityContext)
  if (!context) {
    throw new Error('useCity must be used within a CityProvider')
  }
  return context
}

// Backward-compatible export
export const CITIES = DEFAULT_CITIES
