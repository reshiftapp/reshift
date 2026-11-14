import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CommunityManager } from '@/components/community/community-manager'
import { Database } from '@/types/database.types'
import { MessageSquare } from 'lucide-react'

type PostRow = Database['public']['Tables']['community_posts']['Row']
type ReplyRow = Database['public']['Tables']['community_replies']['Row']
type CategoryRow = Database['public']['Tables']['community_categories']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']

export const dynamic = 'force-dynamic'

export default async function CommunityPage() {
  // Query 1: All Community Posts
  const { data: rawPosts } = await supabaseAdmin
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false })
  const posts = (rawPosts || []) as PostRow[]

  // Query 2: All Community Replies
  const { data: rawReplies } = await supabaseAdmin
    .from('community_replies')
    .select('*')
    .order('created_at', { ascending: true })
  const replies = (rawReplies || []) as ReplyRow[]

  // Query 3: All Community Categories
  const { data: rawCategories } = await supabaseAdmin
    .from('community_categories')
    .select('*')
    .order('sort_order', { ascending: true })
  const categories = (rawCategories || []) as CategoryRow[]

  // Query 4: Profiles for author display
  const { data: rawProfiles } = await supabaseAdmin
    .from('profiles')
    .select('*')
  const profiles = (rawProfiles || []) as ProfileRow[]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Community Moderation Center</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Monitor and moderate discussions, pin announcements, relocate misplaced posts, and configure active categories.
        </p>
      </div>

      {/* Community Moderation Engine */}
      <CommunityManager
        posts={posts}
        replies={replies}
        categories={categories}
        profiles={profiles}
      />
    </div>
  )
}
