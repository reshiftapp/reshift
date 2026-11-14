'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type City = string

export interface CityMetadata {
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
  addCity: (newCity: CityMetadata) => void
}

const CityContext = createContext<CityContextType | undefined>(undefined)

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<City>('Kochi')
  const [citiesList, setCitiesList] = useState<CityMetadata[]>(DEFAULT_CITIES)

  useEffect(() => {
    // 1. Load custom cities from localStorage
    try {
      const savedCustomCities = localStorage.getItem('reshift_custom_cities')
      if (savedCustomCities) {
        const parsed: CityMetadata[] = JSON.parse(savedCustomCities)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...DEFAULT_CITIES]
          parsed.forEach((custom) => {
            if (!merged.some((m) => m.name.toLowerCase() === custom.name.toLowerCase())) {
              merged.push(custom)
            }
          })
          setCitiesList(merged)
        }
      }
    } catch (e) {
      console.error('Error loading custom cities:', e)
    }

    // 2. Load active city
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

  const addCity = (newCity: CityMetadata) => {
    setCitiesList((prev) => {
      if (prev.some((c) => c.name.toLowerCase() === newCity.name.toLowerCase())) {
        return prev
      }
      const updated = [...prev, newCity]
      const customOnly = updated.filter(
        (c) => !DEFAULT_CITIES.some((d) => d.name.toLowerCase() === c.name.toLowerCase())
      )
      localStorage.setItem('reshift_custom_cities', JSON.stringify(customOnly))
      return updated
    })
  }

  const cityMetadata = citiesList.find((c) => c.name.toLowerCase() === city.toLowerCase()) || citiesList[1] || DEFAULT_CITIES[1]

  return (
    <CityContext.Provider value={{ city, setCity, cities: citiesList, cityMetadata, addCity }}>
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
