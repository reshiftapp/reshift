'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function deleteUserAccountPermanently(userId: string) {
  try {
    // 1. Verify caller is Super Admin
    const supabase = await createClient()
    const {
      data: { user: caller },
    } = await supabase.auth.getUser()

    if (!caller) {
      return { success: false, error: 'Unauthorized. Login required.' }
    }

    const callerMeta = caller.user_metadata || {}
    const isSuperAdmin = caller.email === 'reshiftapp@gmail.com' || callerMeta.role === 'super_admin'

    if (!isSuperAdmin) {
      return { success: false, error: 'Forbidden. Only the Super Admin has authority to permanently delete accounts.' }
    }

    // 2. Permanent Protection: Target cannot be the Super Admin
    const { data: targetRecord } = await supabaseAdmin.auth.admin.getUserById(userId)
    const targetUser = targetRecord?.user
    const targetMeta = targetUser?.user_metadata || {}

    if (
      targetUser?.email === 'reshiftapp@gmail.com' ||
      targetMeta.role === 'super_admin'
    ) {
      return { success: false, error: 'The Super Admin root account is permanent and cannot be deleted.' }
    }

    // 3. Delete dependent records across database tables
    await supabaseAdmin.from('user_relocation_steps').delete().eq('user_id', userId)
    await (supabaseAdmin.from as any)('saved_properties').delete().eq('user_id', userId)
    await (supabaseAdmin.from as any)('community_post_likes').delete().eq('user_id', userId)
    await (supabaseAdmin.from as any)('community_comments').delete().eq('author_id', userId)
    await supabaseAdmin.from('community_replies').delete().eq('author_id', userId)
    await supabaseAdmin.from('community_posts').delete().eq('author_id', userId)
    await supabaseAdmin.from('support_tickets').delete().eq('user_id', userId)
    await supabaseAdmin.from('profiles').delete().eq('id', userId)

    // 4. Permanently delete from Supabase Auth
    const { error: deleteAuthErr } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteAuthErr) {
      console.error('Error deleting auth user:', deleteAuthErr)
      return { success: false, error: deleteAuthErr.message }
    }

    revalidatePath('/users')
    revalidatePath('/approvals')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('deleteUserAccountPermanently error:', error)
    return { success: false, error: error.message || 'Failed to delete user account.' }
  }
}

export async function updateUserSuspension(userId: string, isSuspended: boolean, reason?: string) {
  try {
    const { data: userRecord, error: fetchErr } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (fetchErr || !userRecord?.user) {
      return { success: false, error: 'User account not found.' }
    }

    const user = userRecord.user
    const meta = user.user_metadata || {}

    // Permanent Protection: Verify target is not the Super Admin
    if (user.email === 'reshiftapp@gmail.com' || meta.role === 'super_admin') {
      return { success: false, error: 'Super Admin privileges are permanent and cannot be suspended or revoked.' }
    }

    // Ban duration: '876600h' (~100 years) to ban, or 'none' to unban
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: isSuspended ? '876600h' : 'none',
      user_metadata: {
        ...meta,
        is_suspended: isSuspended,
        suspension_reason: isSuspended ? (reason || 'Violated community guidelines') : null,
        suspended_at: isSuspended ? new Date().toISOString() : null,
      },
    })

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
    const { data: userRecord, error: fetchErr } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (fetchErr || !userRecord?.user) {
      return { success: false, error: 'User account not found.' }
    }

    const user = userRecord.user
    const meta = user.user_metadata || {}

    // Permanent Protection: Verify target is not the Super Admin
    if (user.email === 'reshiftapp@gmail.com' || meta.role === 'super_admin') {
      return { success: false, error: 'Super Admin access is permanent and cannot be modified or revoked.' }
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...meta,
        role: role,
      },
    })

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
