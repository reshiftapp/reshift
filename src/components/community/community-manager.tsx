'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils'
import {
  togglePostPinned,
  togglePostHidden,
  movePostCategory,
  editPostContent,
  deleteCommunityPost,
  deleteCommunityReply,
  toggleCategoryActive,
} from '@/app/community/actions'
import {
  MessageSquare,
  Pin,
  EyeOff,
  Eye,
  Trash2,
  Edit,
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
  Tag,
} from 'lucide-react'

type PostRow = Database['public']['Tables']['community_posts']['Row']
type ReplyRow = Database['public']['Tables']['community_replies']['Row']
type CategoryRow = Database['public']['Tables']['community_categories']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']

interface CommunityManagerProps {
  posts: PostRow[]
  replies: ReplyRow[]
  categories: CategoryRow[]
  profiles: ProfileRow[]
}

export function CommunityManager({
  posts,
  replies,
  categories,
  profiles,
}: CommunityManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts')

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [cityFilter, setCityFilter] = useState('All')
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  // Map author profile by ID
  const profileMap = useMemo(() => {
    const map = new Map<string, ProfileRow>()
    profiles.forEach((p) => map.set(p.id, p))
    return map
  }, [profiles])

  // Map replies by post ID
  const repliesByPost = useMemo(() => {
    const map = new Map<string, ReplyRow[]>()
    replies.forEach((r) => {
      const list = map.get(r.post_id) || []
      list.push(r)
      map.set(r.post_id, list)
    })
    return map
  }, [replies])

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const author = profileMap.get(p.author_id)
      const authorName = author?.full_name || ''
      const authorEmail = author?.email || ''

      const matchSearch =
        search === '' ||
        p.content.toLowerCase().includes(search.toLowerCase()) ||
        authorName.toLowerCase().includes(search.toLowerCase()) ||
        authorEmail.toLowerCase().includes(search.toLowerCase())

      const matchCategory = categoryFilter === 'All' || p.category === categoryFilter
      const matchCity = cityFilter === 'All' || p.city === cityFilter

      return matchSearch && matchCategory && matchCity
    })
  }, [posts, search, categoryFilter, cityFilter, profileMap])

  const handleTogglePin = (id: string, current: boolean) => {
    startTransition(async () => {
      await togglePostPinned(id, !current)
      router.refresh()
    })
  }

  const handleToggleHide = (id: string, current: boolean) => {
    startTransition(async () => {
      await togglePostHidden(id, !current, current ? undefined : 'Soft-hidden by moderator')
      router.refresh()
    })
  }

  const handleMoveCategory = (id: string, newCat: string) => {
    startTransition(async () => {
      await movePostCategory(id, newCat)
      router.refresh()
    })
  }

  const handleSaveEdit = (id: string) => {
    startTransition(async () => {
      await editPostContent(id, editContent)
      setEditingPostId(null)
      router.refresh()
    })
  }

  const handleDeletePost = (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this post and all its replies?')) return
    startTransition(async () => {
      await deleteCommunityPost(id)
      router.refresh()
    })
  }

  const handleDeleteReply = (id: string) => {
    if (!confirm('Delete this reply?')) return
    startTransition(async () => {
      await deleteCommunityReply(id)
      router.refresh()
    })
  }

  const handleToggleCategoryActive = (slug: string, current: boolean) => {
    startTransition(async () => {
      await toggleCategoryActive(slug, !current)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-px">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'posts'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/20'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Post Feed Moderation</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {posts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'categories'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/20'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Category Settings</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {categories.length}
          </span>
        </button>
      </div>

      {activeTab === 'posts' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 p-4 rounded-2xl shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search post content, author name or email..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="All">All Cities</option>
                <option value="Kochi">Kochi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Trivandrum">Trivandrum</option>
                <option value="Calicut">Calicut</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-3">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((p) => {
                const author = profileMap.get(p.author_id)
                const postReplies = repliesByPost.get(p.id) || []
                const isExpanded = expandedPostId === p.id
                const isEditing = editingPostId === p.id

                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl border p-5 transition-all shadow-2xs ${
                      p.is_pinned
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/50'
                        : p.is_hidden
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 opacity-75'
                        : 'bg-white dark:bg-[#111113] border-zinc-200 dark:border-white/10'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center">
                          {(author?.full_name || author?.email || 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-900 dark:text-white text-sm">
                              {author?.full_name || 'Anonymous User'}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                              ({author?.email || p.author_id.slice(0, 8)})
                            </span>
                            {p.is_pinned && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1">
                                <Pin className="w-2.5 h-2.5" /> Pinned
                              </span>
                            )}
                            {p.is_hidden && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 flex items-center gap-1">
                                <EyeOff className="w-2.5 h-2.5" /> Soft-Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[10px] border border-zinc-200 dark:border-zinc-700">
                              {p.category}
                            </span>
                            {p.city && (
                              <span className="flex items-center gap-1 text-[11px]">
                                <MapPin className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> {p.city}
                              </span>
                            )}
                            <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">
                              {formatDate(p.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        {/* Pin / Unpin */}
                        <button
                          onClick={() => handleTogglePin(p.id, p.is_pinned)}
                          disabled={isPending}
                          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                            p.is_pinned
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                          }`}
                          title={p.is_pinned ? 'Unpin post' : 'Pin to top of feed'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        {/* Soft Hide / Unhide */}
                        <button
                          onClick={() => handleToggleHide(p.id, p.is_hidden)}
                          disabled={isPending}
                          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                            p.is_hidden
                              ? 'bg-rose-600 text-white border-rose-500'
                              : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                          }`}
                          title={p.is_hidden ? 'Restore post visibility' : 'Soft-hide post'}
                        >
                          {p.is_hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        {/* Edit Content */}
                        <button
                          onClick={() => {
                            if (isEditing) {
                              setEditingPostId(null)
                            } else {
                              setEditingPostId(p.id)
                              setEditContent(p.content)
                            }
                          }}
                          className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                          title="Edit post text"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Category Selector */}
                        <select
                          value={p.category}
                          onChange={(e) => handleMoveCategory(p.id, e.target.value)}
                          disabled={isPending}
                          className="px-2 py-1.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                          title="Move post to different category"
                        >
                          {categories.map((c) => (
                            <option key={c.slug} value={c.name}>
                              Move to: {c.name}
                            </option>
                          ))}
                        </select>

                        {/* Hard Delete */}
                        <button
                          onClick={() => handleDeletePost(p.id)}
                          disabled={isPending}
                          className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 transition-colors cursor-pointer"
                          title="Permanently Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="mt-3 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed pl-12">
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full h-24 p-3 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveEdit(p.id)}
                              disabled={isPending}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white cursor-pointer shadow-2xs"
                            >
                              Save Content
                            </button>
                            <button
                              onClick={() => setEditingPostId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p>{p.content}</p>
                      )}
                    </div>

                    {/* Replies Accordion Toggle */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pl-12">
                      <button
                        onClick={() => setExpandedPostId(isExpanded ? null : p.id)}
                        className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{postReplies.length} Replies</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {p.is_hidden && p.hidden_reason && (
                        <span className="text-[11px] text-rose-600 dark:text-rose-400 italic">
                          Reason: {p.hidden_reason}
                        </span>
                      )}
                    </div>

                    {/* Replies List */}
                    {isExpanded && (
                      <div className="mt-3 pl-12 space-y-2">
                        {postReplies.length > 0 ? (
                          postReplies.map((r) => {
                            const replyAuthor = profileMap.get(r.author_id)
                            return (
                              <div
                                key={r.id}
                                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-3 text-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-zinc-900 dark:text-white">
                                      {replyAuthor?.full_name || 'Anonymous User'}
                                    </span>
                                    <span className="text-zinc-400 dark:text-zinc-500 text-[10px]">
                                      {formatDate(r.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-zinc-700 dark:text-zinc-300">{r.body}</p>
                                </div>
                                <button
                                  onClick={() => handleDeleteReply(r.id)}
                                  disabled={isPending}
                                  className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition-colors cursor-pointer"
                                  title="Delete Reply"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )
                          })
                        ) : (
                          <div className="text-xs text-zinc-400 dark:text-zinc-500 italic py-2">
                            No replies on this post yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="p-12 text-center text-sm text-zinc-400 dark:text-zinc-500 bg-white dark:bg-[#111113] rounded-2xl border border-zinc-200 dark:border-zinc-800">
                No community discussions found matching your filter criteria.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Categories Management Tab */
        <div className="rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Live Mobile App Community Categories</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Toggle categories on/off to control what appears in the mobile app category filter
              </p>
            </div>
          </div>
          <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Slug</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Sort Order</th>
                <th className="px-6 py-3.5">Mobile Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {categories.map((c) => (
                <tr key={c.slug} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-zinc-900 dark:text-white">
                    {c.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-indigo-600 dark:text-indigo-400">
                    {c.slug}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                    {c.description || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
                    {c.sort_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs">
                    <button
                      onClick={() => handleToggleCategoryActive(c.slug, c.is_active)}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        c.is_active
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${c.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>{c.is_active ? 'Active in App' : 'Hidden'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
