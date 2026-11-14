import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()

    if (!query) {
      return NextResponse.json(
        { success: false, message: 'City name or address query is required' },
        { status: 400 }
      )
    }

    const googleMapsApiKey =
      process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    // Strategy 1: Official Google Maps Geocoding API if API key configured
    if (googleMapsApiKey) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          query
        )}&key=${googleMapsApiKey}`
        const googleRes = await fetch(googleUrl)
        const googleData = await googleRes.json()

        if (googleData.status === 'OK' && googleData.results?.length > 0) {
          const result = googleData.results[0]
          const location = result.geometry.location

          // Extract state/administrative area from address components
          let state = ''
          let locality = ''
          result.address_components?.forEach((comp: any) => {
            if (comp.types.includes('administrative_area_level_1')) {
              state = comp.long_name
            }
            if (comp.types.includes('locality')) {
              locality = comp.long_name
            }
          })

          return NextResponse.json({
            success: true,
            lat: parseFloat(location.lat.toFixed(6)),
            lng: parseFloat(location.lng.toFixed(6)),
            state: state || '',
            cityName: locality || query,
            formattedAddress: result.formatted_address,
            source: 'Google Maps API',
            googleMapsUrl: `https://www.google.com/maps?q=${location.lat},${location.lng}`,
          })
        }
      } catch (googleErr) {
        console.warn('Google Maps API request failed, falling back to Geocoding Engine:', googleErr)
      }
    }

    // Strategy 2: High-Precision Global Geocoding Engine (OpenStreetMap / Nominatim)
    // First try with regional suffix, then fallback to global query
    const searchQueries = [
      `${query}, India`,
      query,
    ]

    for (const q of searchQueries) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          q
        )}&format=json&addressdetails=1&limit=1`

        const res = await fetch(url, {
          headers: {
            'User-Agent': 'ReShift-Platform/1.0 (admin-geocoding; reshiftapp@gmail.com)',
            Accept: 'application/json',
          },
        })

        if (!res.ok) continue
        const data = await res.json()

        if (data && data.length > 0) {
          const item = data[0]
          const addr = item.address || {}
          const state = (addr.state || addr.province || addr.state_district || '')
            .replace(/ State| Territory/gi, '')
            .trim()
          const cityName = addr.city || addr.town || addr.municipality || query

          const lat = parseFloat(parseFloat(item.lat).toFixed(6))
          const lng = parseFloat(parseFloat(item.lon).toFixed(6))

          return NextResponse.json({
            success: true,
            lat,
            lng,
            state: state || '',
            cityName,
            formattedAddress: item.display_name,
            source: 'Global Geocoding (Google Maps Format)',
            googleMapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
          })
        }
      } catch (err) {
        console.warn(`Geocoding attempt for '${q}' failed:`, err)
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: `Could not find coordinates for "${query}". Please check the spelling or enter coordinates manually.`,
      },
      { status: 404 }
    )
  } catch (error: any) {
    console.error('Geocoding route error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Geocoding service error' },
      { status: 500 }
    )
  }
}
