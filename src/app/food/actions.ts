'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Database } from '@/types/database.types'

type FoodInsert = Database['public']['Tables']['food_spots']['Insert']
type FoodUpdate = Database['public']['Tables']['food_spots']['Update']

export async function createFoodSpot(data: FoodInsert) {
  try {
    const { error } = await supabaseAdmin
      .from('food_spots')
      .insert(data)

    if (error) throw error
    revalidatePath('/food')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateFoodSpot(id: string, data: FoodUpdate) {
  try {
    const { error } = await supabaseAdmin
      .from('food_spots')
      .update(data)
      .eq('id', id)

    if (error) throw error
    revalidatePath('/food')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function toggleFoodAvailable(id: string, isAvailable: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('food_spots')
      .update({ is_available_now: isAvailable })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/food')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteFoodSpot(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('food_spots')
      .delete()
      .eq('id', id)

    if (error) throw error
    revalidatePath('/food')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
