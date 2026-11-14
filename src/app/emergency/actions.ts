'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Database } from '@/types/database.types'

type EmergencyInsert = Database['public']['Tables']['emergency_services']['Insert']

export async function createEmergencyService(data: EmergencyInsert) {
  try {
    const { error } = await supabaseAdmin.from('emergency_services').insert(data)
    if (error) throw error
    revalidatePath('/emergency')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteEmergencyService(id: string) {
  try {
    const { error } = await supabaseAdmin.from('emergency_services').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/emergency')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
