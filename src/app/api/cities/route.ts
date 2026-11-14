import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_CITIES, CityMetadata } from '@/contexts/city-context'

export const dynamic = 'force-dynamic'

async function getAuthorizedUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const isSuperAdmin =
      user.email === 'reshiftapp@gmail.com' || user.user_metadata?.role === 'super_admin'

    return { user, isSuperAdmin }
  } catch {
    return null
  }
}

// GET /api/cities: Returns all active operational cities
export async function GET() {
  try {
    const { data: dbCities, error } = await (supabaseAdmin.from as any)('cities')
      .select('*')
      .order('name', { ascending: true })

    if (error || !dbCities) {
      // If table has not been created yet in Supabase, return default cities
      return NextResponse.json({
        success: true,
        cities: DEFAULT_CITIES,
        source: 'default',
      })
    }

    const formattedCities: CityMetadata[] = [
      DEFAULT_CITIES[0], // 'All'
      ...dbCities.map((c: any) => ({
        id: c.id,
        name: c.name,
        label: c.label || c.name,
        state: c.state,
        centerCoordinates: {
          lat: c.latitude,
          lng: c.longitude,
        },
      })),
    ]

    return NextResponse.json({
      success: true,
      cities: formattedCities,
      source: 'database',
    })
  } catch (error: any) {
    console.error('Error fetching cities:', error)
    return NextResponse.json({
      success: true,
      cities: DEFAULT_CITIES,
      source: 'fallback',
    })
  }
}

// POST /api/cities: Add a new operational city (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthorizedUser()
    if (!auth || !auth.isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Administrator access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, state, lat, lng } = body

    if (!name?.trim() || !state?.trim()) {
      return NextResponse.json(
        { success: false, message: 'City name and state are required.' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()
    const trimmedState = state.trim()
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { success: false, message: 'Valid latitude and longitude numbers are required.' },
        { status: 400 }
      )
    }

    // Try inserting into database table
    const { data: inserted, error: insertError } = await (supabaseAdmin.from as any)('cities')
      .insert({
        name: trimmedName,
        label: trimmedName,
        state: trimmedState,
        latitude,
        longitude,
        is_active: true,
        created_by: auth.user.id,
      })
      .select()
      .single()

    if (insertError) {
      // If table doesn't exist yet, return gracefully with metadata so client localStorage can persist
      if (insertError.code === 'PGRST205') {
        return NextResponse.json({
          success: true,
          city: {
            name: trimmedName,
            label: trimmedName,
            state: trimmedState,
            centerCoordinates: { lat: latitude, lng: longitude },
          },
          warning: 'Cities table not found in Supabase schema. Stored in client state.',
        })
      }

      return NextResponse.json(
        { success: false, message: insertError.message || 'Failed to save city to database.' },
        { status: 500 }
      )
    }

    // Log to audit log
    await (supabaseAdmin.from as any)('moderator_audit_log').insert({
      moderator_id: auth.user.id,
      action: 'ADD_OPERATIONAL_CITY',
      table_name: 'cities',
      record_id: inserted.id,
      new_value: { name: trimmedName, state: trimmedState, latitude, longitude },
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      city: {
        id: inserted.id,
        name: inserted.name,
        label: inserted.label,
        state: inserted.state,
        centerCoordinates: { lat: inserted.latitude, lng: inserted.longitude },
      },
    })
  } catch (error: any) {
    console.error('Error adding city:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/cities: Permanently delete a city from database (Super Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthorizedUser()
    if (!auth || !auth.isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Administrator access required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const cityName = searchParams.get('name')?.trim()
    const cityId = searchParams.get('id')?.trim()

    if (!cityName && !cityId) {
      return NextResponse.json(
        { success: false, message: 'City name or ID is required for deletion.' },
        { status: 400 }
      )
    }

    if (cityName?.toLowerCase() === 'all') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete the master filter "All".' },
        { status: 400 }
      )
    }

    // Delete permanently from Supabase cities table
    if (cityId) {
      await (supabaseAdmin.from as any)('cities').delete().eq('id', cityId)
    } else if (cityName) {
      await (supabaseAdmin.from as any)('cities').delete().ilike('name', cityName)
    }

    // Log permanent deletion in audit log
    await (supabaseAdmin.from as any)('moderator_audit_log').insert({
      moderator_id: auth.user.id,
      action: 'PERMANENT_DELETE_CITY',
      table_name: 'cities',
      record_id: cityId || cityName,
      old_value: { name: cityName },
      new_value: null,
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      message: `City '${cityName || cityId}' permanently deleted from database.`,
    })
  } catch (error: any) {
    console.error('Error deleting city:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
