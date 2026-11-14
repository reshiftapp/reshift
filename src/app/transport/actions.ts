'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Database } from '@/types/database.types'

type StopInsert = Database['public']['Tables']['transport_stops']['Insert']
type RouteInsert = Database['public']['Tables']['bus_routes']['Insert']

export async function createTransportStop(data: StopInsert) {
  try {
    const { error } = await supabaseAdmin
      .from('transport_stops')
      .insert(data)

    if (error) throw error
    revalidatePath('/transport')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteTransportStop(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('transport_stops')
      .delete()
      .eq('id', id)

    if (error) throw error
    revalidatePath('/transport')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createBusRoute(data: RouteInsert, stopsList: string[]) {
  try {
    const { data: route, error } = await supabaseAdmin
      .from('bus_routes')
      .insert(data)
      .select()
      .single()

    if (error) throw error

    // Insert stops
    if (stopsList.length > 0) {
      const stopRows = stopsList.map((stopName, idx) => ({
        route_id: route.id,
        stop_order: idx + 1,
        stop_name: stopName,
      }))

      await supabaseAdmin.from('bus_route_stops').insert(stopRows)
    }

    revalidatePath('/transport')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteBusRoute(id: string) {
  try {
    await supabaseAdmin.from('bus_route_stops').delete().eq('route_id', id)
    const { error } = await supabaseAdmin.from('bus_routes').delete().eq('id', id)

    if (error) throw error
    revalidatePath('/transport')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function toggleRouteActive(id: string, isActive: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('bus_routes')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/transport')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
