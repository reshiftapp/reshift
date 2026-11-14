import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { UserTable } from '@/components/users/user-table'
import { Database } from '@/types/database.types'
import { Users, UserPlus } from 'lucide-react'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const { data: rawProfiles } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const users = (rawProfiles || []) as ProfileRow[]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#5B6FD0]" />
            <span>App Customers & Registered Residents</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered customers from the Flutter mobile app ({users.length} residents). Customers browse and apply for properties listed by our staff.
          </p>
        </div>
      </div>

      {/* User Records Table */}
      <UserTable users={users} />
    </div>
  )
}
