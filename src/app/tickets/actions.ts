'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function updateTicketStatus(id: string, status: string) {
  try {
    const { error } = await supabaseAdmin
      .from('support_tickets')
      .update({
        status,
      })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/tickets')
    revalidatePath(`/tickets/${id}`)
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateTicketPriority(id: string, priority: string) {
  try {
    const { error } = await supabaseAdmin
      .from('support_tickets')
      .update({ priority })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/tickets')
    revalidatePath(`/tickets/${id}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function addTicketNote(ticketId: string, moderatorId: string, note: string) {
  try {
    const { error } = await supabaseAdmin
      .from('ticket_notes')
      .insert({
        ticket_id: ticketId,
        moderator_id: moderatorId,
        note,
        created_at: new Date().toISOString(),
      })

    if (error) throw error
    revalidatePath(`/tickets/${ticketId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
