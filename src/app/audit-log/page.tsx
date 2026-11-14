import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { AuditTable } from '@/components/audit/audit-table'
import { Database } from '@/types/database.types'
import { ShieldCheck } from 'lucide-react'

type AuditRow = Database['public']['Tables']['moderator_audit_log']['Row']

export const dynamic = 'force-dynamic'

export default async function AuditLogPage() {
  let logs: AuditRow[] = []

  try {
    const { data: rawLogs, error } = await supabaseAdmin
      .from('moderator_audit_log')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && rawLogs) {
      logs = rawLogs as AuditRow[]
    }
  } catch (err) {
    console.warn('Audit logs query fallback:', err)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Security Audit Trail</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Immutable system log capturing database mutations, operator identities, before/after JSON snapshots, and compliance events.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Audit Ledger Active</span>
        </div>
      </div>

      <AuditTable logs={logs} />
    </div>
  )
}
