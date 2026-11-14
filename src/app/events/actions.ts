'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Database } from '@/types/database.types'

type EventInsert = Database['public']['Tables']['events']['Insert']
type EventUpdate = Database['public']['Tables']['events']['Update']

export async function createEvent(data: EventInsert) {
  try {
    const { error } = await supabaseAdmin
      .from('events')
      .insert(data)

    if (error) throw error
    revalidatePath('/events')
    revalidatePath('/carousels')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateEvent(id: string, data: EventUpdate) {
  try {
    const { error } = await supabaseAdmin
      .from('events')
      .update(data)
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

export async function toggleEventFeatured(id: string, isFeatured: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('events')
      .update({ is_featured: isFeatured })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/events')
    revalidatePath('/carousels')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function toggleEventActive(id: string, isActive: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('events')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/events')
    return { success: true }
  } catch (error: any) {
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
