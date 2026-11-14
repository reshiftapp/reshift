'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Database } from '@/types/database.types'

type GuideInsert = Database['public']['Tables']['local_guides']['Insert']

export async function createLocalGuide(data: GuideInsert) {
  try {
    const { error } = await supabaseAdmin.from('local_guides').insert(data)
    if (error) throw error
    revalidatePath('/guides')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteLocalGuide(id: string) {
  try {
    const { error } = await supabaseAdmin.from('local_guides').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/guides')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
