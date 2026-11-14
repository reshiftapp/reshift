'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Database } from '@/types/database.types'

type CardInsert = Database['public']['Tables']['explore_cards']['Insert']
type BannerInsert = Database['public']['Tables']['app_banners']['Insert']

export async function createExploreCard(data: CardInsert) {
  try {
    const { error } = await supabaseAdmin.from('explore_cards').insert(data)
    if (error) throw error
    revalidatePath('/carousels')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteExploreCard(id: string) {
  try {
    const { error } = await supabaseAdmin.from('explore_cards').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/carousels')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createAppBanner(data: BannerInsert) {
  try {
    const { error } = await supabaseAdmin.from('app_banners').insert(data)
    if (error) throw error
    revalidatePath('/carousels')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteAppBanner(id: string) {
  try {
    const { error } = await supabaseAdmin.from('app_banners').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/carousels')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
