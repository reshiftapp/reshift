'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function togglePostPinned(id: string, isPinned: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('community_posts')
      .update({ is_pinned: isPinned })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/community')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function togglePostHidden(id: string, isHidden: boolean, reason?: string) {
  try {
    const { error } = await supabaseAdmin
      .from('community_posts')
      .update({
        is_hidden: isHidden,
        hidden_reason: isHidden ? (reason || 'Flagged by moderator') : null,
      })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/community')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function movePostCategory(id: string, newCategory: string) {
  try {
    const { error } = await supabaseAdmin
      .from('community_posts')
      .update({
        category: newCategory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/community')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function editPostContent(id: string, content: string) {
  try {
    const { error } = await supabaseAdmin
      .from('community_posts')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/community')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteCommunityPost(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('community_posts')
      .delete()
      .eq('id', id)

    if (error) throw error
    revalidatePath('/community')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteCommunityReply(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('community_replies')
      .delete()
      .eq('id', id)

    if (error) throw error
    revalidatePath('/community')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function toggleCategoryActive(slug: string, isActive: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('community_categories')
      .update({ is_active: isActive })
      .eq('slug', slug)

    if (error) throw error
    revalidatePath('/community')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
