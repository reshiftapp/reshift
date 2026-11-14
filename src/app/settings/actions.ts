'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function toggleStepActive(id: string, isActive: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('relocation_steps')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/settings')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateStepDetails(id: string, title: string, subtitle: string) {
  try {
    const { error } = await supabaseAdmin
      .from('relocation_steps')
      .update({ title, subtitle })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/settings')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
