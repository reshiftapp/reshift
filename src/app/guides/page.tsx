import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { GuidesManager } from '@/components/guides/guides-manager'
import { Database } from '@/types/database.types'
import { BookOpen } from 'lucide-react'

type GuideRow = Database['public']['Tables']['local_guides']['Row']

export const dynamic = 'force-dynamic'

export default async function GuidesPage() {
  const { data: rawGuides } = await supabaseAdmin.from('local_guides').select('*')
  const guides = (rawGuides || []) as GuideRow[]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-[#5B6FD0]" />
          <span>Local City Guides & Recommendations</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Publish insider neighborhood guides, cultural walks, food hotspots, and essential tips for new residents.
        </p>
      </div>

      <GuidesManager guides={guides} />
    </div>
  )
}
