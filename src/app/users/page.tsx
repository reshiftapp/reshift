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
  const customerCount = users.filter((u) => u.email !== 'reshiftapp@gmail.com').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>App Customers & Registered Residents</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Registered customers from the Flutter mobile app ({customerCount} residents). Customers browse and apply for properties listed by our staff.
          </p>
        </div>
      </div>

      {/* User Records Table */}
      <UserTable users={users} />
    </div>
  )
}
