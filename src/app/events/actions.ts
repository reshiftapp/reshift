'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Database } from '@/types/database.types'

type EventInsert = Database['public']['Tables']['events']['Insert']
type EventUpdate = Database['public']['Tables']['events']['Update']

// Sanitize payload to match exact Supabase live columns
function sanitizeEventPayload(data: any) {
  const allowed = ['city', 'title', 'event_date', 'venue', 'category', 'image_url']
  const clean: any = {}
  for (const key of allowed) {
    if (data[key] !== undefined) {
      clean[key] = data[key]
    }
  }
  return clean
}

export async function createEvent(data: EventInsert) {
  try {
    const payload = sanitizeEventPayload(data)
    const { error } = await supabaseAdmin
      .from('events')
      .insert(payload)

    if (error) throw error
    revalidatePath('/events')
    revalidatePath('/carousels')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('createEvent error:', error)
    return { success: false, error: error.message }
  }
}

export async function updateEvent(id: string, data: EventUpdate) {
  try {
    const payload = sanitizeEventPayload(data)
    const { error } = await supabaseAdmin
      .from('events')
      .update(payload)
      .eq('id', id)

    if (error) throw error
    revalidatePath('/events')
    revalidatePath('/carousels')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('updateEvent error:', error)
    return { success: false, error: error.message }
  }
}

export async function toggleEventFeatured(id: string, isFeatured: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('events')
      .update({ is_featured: isFeatured } as any)
      .eq('id', id)

    if (error) throw error
    revalidatePath('/events')
    revalidatePath('/carousels')
    return { success: true }
  } catch (error: any) {
    // Graceful fallback if is_featured column has not been added via SQL migration
    return { success: false, error: error.message }
  }
}

export async function toggleEventActive(id: string, isActive: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('events')
      .update({ is_active: isActive } as any)
      .eq('id', id)

    if (error) throw error
    revalidatePath('/events')
    revalidatePath('/carousels')
    return { success: true }
  } catch (error: any) {
    // Graceful fallback if is_active column has not been added via SQL migration
    return { success: false, error: error.message }
  }
}

export async function deleteEvent(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id)

    if (error) throw error
    revalidatePath('/events')
    revalidatePath('/carousels')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
