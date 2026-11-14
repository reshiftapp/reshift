'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Database } from '@/types/database.types'

type PlanInsert = Database['public']['Tables']['internet_plans']['Insert']

export async function createInternetPlan(data: PlanInsert) {
  try {
    const { error } = await supabaseAdmin.from('internet_plans').insert(data)
    if (error) throw error
    revalidatePath('/internet')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function toggleInternetAvailable(id: string, isAvailable: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('internet_plans')
      .update({ is_available: isAvailable })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/internet')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteInternetPlan(id: string) {
  try {
    const { error } = await supabaseAdmin.from('internet_plans').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/internet')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
