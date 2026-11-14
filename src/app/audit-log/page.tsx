import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { AuditTable } from '@/components/audit/audit-table'
import { Database } from '@/types/database.types'
import { ShieldCheck } from 'lucide-react'

type AuditRow = Database['public']['Tables']['moderator_audit_log']['Row']

export const dynamic = 'force-dynamic'

export default async function AuditLogPage() {
  const { data: rawLogs } = await supabaseAdmin
    .from('moderator_audit_log')
    .select('*')
    .order('created_at', { ascending: false })

  const logs = (rawLogs || []) as AuditRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-[#5B6FD0]" />
          <span>Security Audit Trail</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Immutable system log capturing database mutations, operator identities, before/after JSON snapshots, and compliance events.
        </p>
      </div>

      <AuditTable logs={logs} />
    </div>
  )
}
