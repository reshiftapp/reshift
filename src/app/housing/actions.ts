'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Database } from '@/types/database.types'

type PropertyInsert = Database['public']['Tables']['properties']['Insert']
type PropertyUpdate = Database['public']['Tables']['properties']['Update']

export async function createProperty(data: PropertyInsert) {
  try {
    const { data: created, error } = await supabaseAdmin
      .from('properties')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    revalidatePath('/housing')
    revalidatePath('/')
    return { success: true, data: created }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateProperty(id: string, data: PropertyUpdate) {
  try {
    const { error } = await supabaseAdmin
      .from('properties')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/housing')
    revalidatePath(`/housing/${id}`)
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function togglePropertyActive(id: string, isActive: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('properties')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/housing')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function togglePropertyVerified(id: string, isVerified: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('properties')
      .update({
        is_verified: isVerified,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/housing')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteProperty(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('properties')
      .delete()
      .eq('id', id)

    if (error) throw error
    revalidatePath('/housing')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function bulkInsertProperties(properties: PropertyInsert[]) {
  try {
    const { error } = await supabaseAdmin
      .from('properties')
      .insert(properties)

    if (error) throw error
    revalidatePath('/housing')
    revalidatePath('/')
    return { success: true, count: properties.length }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
