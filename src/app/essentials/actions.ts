'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Database } from '@/types/database.types'

type EssentialInsert = Database['public']['Tables']['essential_places']['Insert']

export async function createEssentialPlace(data: EssentialInsert) {
  try {
    const { error } = await supabaseAdmin.from('essential_places').insert(data)
    if (error) throw error
    revalidatePath('/essentials')
    revalidatePath('/services')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function toggleEssentialOpen(id: string, isOpen: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('essential_places')
      .update({ is_open: isOpen })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/essentials')
    revalidatePath('/services')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteEssentialPlace(id: string) {
  try {
    const { error } = await supabaseAdmin.from('essential_places').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/essentials')
    revalidatePath('/services')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
