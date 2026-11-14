import React from 'react'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { UserDetailView } from '@/components/users/user-detail-view'
import { Database } from '@/types/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type StepRow = Database['public']['Tables']['relocation_steps']['Row']
type UserStepRow = Database['public']['Tables']['user_relocation_steps']['Row']
type PostRow = Database['public']['Tables']['community_posts']['Row']
type ReplyRow = Database['public']['Tables']['community_replies']['Row']
type TicketRow = Database['public']['Tables']['support_tickets']['Row']

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params

  // 1. Fetch user profile
  const { data: rawUser } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!rawUser) {
    notFound()
  }

  const user = rawUser as ProfileRow

  // 2. Fetch all relocation steps
  const { data: rawSteps } = await supabaseAdmin
    .from('relocation_steps')
    .select('*')
    .order('sort_order', { ascending: true })
  const relocationSteps = (rawSteps || []) as StepRow[]

  // 3. Fetch user's completion status
  const { data: rawUserSteps } = await supabaseAdmin
    .from('user_relocation_steps')
    .select('*')
    .eq('user_id', id)
  const userSteps = (rawUserSteps || []) as UserStepRow[]

  // 4. Fetch community posts authored by user
  const { data: rawPosts } = await supabaseAdmin
    .from('community_posts')
    .select('*')
    .eq('author_id', id)
    .order('created_at', { ascending: false })
  const posts = (rawPosts || []) as PostRow[]

  // 5. Fetch community replies authored by user
  const { data: rawReplies } = await supabaseAdmin
    .from('community_replies')
    .select('*')
    .eq('author_id', id)
    .order('created_at', { ascending: false })
  const replies = (rawReplies || []) as ReplyRow[]

  // 6. Fetch support tickets submitted by user
  const { data: rawTickets } = await supabaseAdmin
    .from('support_tickets')
    .select('*')
    .or(`user_id.eq.${id},user_email.eq.${user.email}`)
    .order('created_at', { ascending: false })
  const tickets = (rawTickets || []) as TicketRow[]

  return (
    <UserDetailView
      user={user}
      relocationSteps={relocationSteps}
      userSteps={userSteps}
      posts={posts}
      replies={replies}
      tickets={tickets}
    />
  )
}
