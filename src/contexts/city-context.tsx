'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type City = 'All' | 'Kochi' | 'Bangalore' | 'Trivandrum' | 'Calicut' | 'Chennai'

export interface CityMetadata {
  name: City
  label: string
  state: string
  centerCoordinates: {
    lat: number
    lng: number
  }
}

export const CITIES: CityMetadata[] = [
  { name: 'All', label: 'All Cities', state: 'Pan-India', centerCoordinates: { lat: 10.0, lng: 76.5 } },
  { name: 'Kochi', label: 'Kochi', state: 'Kerala', centerCoordinates: { lat: 9.9312, lng: 76.2673 } },
  { name: 'Bangalore', label: 'Bangalore', state: 'Karnataka', centerCoordinates: { lat: 12.9716, lng: 77.5946 } },
  { name: 'Trivandrum', label: 'Trivandrum', state: 'Kerala', centerCoordinates: { lat: 8.5241, lng: 76.9366 } },
  { name: 'Calicut', label: 'Calicut', state: 'Kerala', centerCoordinates: { lat: 11.2588, lng: 75.7804 } },
  { name: 'Chennai', label: 'Chennai', state: 'Tamil Nadu', centerCoordinates: { lat: 13.0827, lng: 80.2707 } },
]

interface CityContextType {
  city: City
  setCity: (city: City) => void
  cityMetadata: CityMetadata
}

const CityContext = createContext<CityContextType | undefined>(undefined)

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<City>('Kochi')

  useEffect(() => {
    const saved = localStorage.getItem('reshift_active_city') as City
    if (saved && CITIES.some((c) => c.name === saved)) {
      setCityState(saved)
    }
  }, [])

  const setCity = (newCity: City) => {
    setCityState(newCity)
    localStorage.setItem('reshift_active_city', newCity)
    // Set cookie so server-side actions can also read active city
    document.cookie = `reshift_city=${newCity}; path=/; max-age=31536000`
  }

  const cityMetadata = CITIES.find((c) => c.name === city) || CITIES[1]

  return (
    <CityContext.Provider value={{ city, setCity, cityMetadata }}>
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
