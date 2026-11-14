'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function updateUserSuspension(userId: string, isSuspended: boolean, reason?: string) {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        is_suspended: isSuspended,
        suspension_reason: isSuspended ? (reason || 'Violated community guidelines') : null,
        suspended_at: isSuspended ? new Date().toISOString() : null,
      })
      .eq('id', userId)

    if (error) throw error
    revalidatePath('/users')
    revalidatePath(`/users/${userId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateModeratorRole(userId: string, role: 'content_editor' | 'moderator' | 'super_admin' | null) {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ moderator_role: role })
      .eq('id', userId)

    if (error) throw error
    revalidatePath('/users')
    revalidatePath(`/users/${userId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function sendPasswordReset(email: string) {
  try {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://reshift.app/reset-password',
    })
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function toggleRelocationStep(userId: string, stepId: string, isCompleted: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('user_relocation_steps')
      .upsert({
        user_id: userId,
        step_id: stepId,
        is_completed: isCompleted,
        updated_at: new Date().toISOString(),
      })

    if (error) throw error
    revalidatePath(`/users/${userId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deletePostByModerator(postId: string, userId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('community_posts')
      .delete()
      .eq('id', postId)

    if (error) throw error
    revalidatePath('/community')
    revalidatePath(`/users/${userId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteReplyByModerator(replyId: string, userId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('community_replies')
      .delete()
      .eq('id', replyId)

    if (error) throw error
    revalidatePath('/community')
    revalidatePath(`/users/${userId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
