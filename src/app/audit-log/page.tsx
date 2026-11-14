import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { AuditTable } from '@/components/audit/audit-table'
import { Database } from '@/types/database.types'
import { ShieldCheck, Info } from 'lucide-react'

type AuditRow = Database['public']['Tables']['moderator_audit_log']['Row']

export const dynamic = 'force-dynamic'

export default async function AuditLogPage() {
  const { data: rawLogs, error } = await supabaseAdmin
    .from('moderator_audit_log')
    .select('*')
    .order('created_at', { ascending: false })

  const logs = (rawLogs || []) as AuditRow[]
  const isTableMissing = Boolean(error && error.message.includes('moderator_audit_log'))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Security Audit Trail</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Immutable system log capturing database mutations, operator identities, before/after JSON snapshots, and compliance events.
        </p>
      </div>

      {isTableMissing && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold">Notice for Super Admin:</span> The security audit log table (`moderator_audit_log`) has not yet been initialized in your Supabase project. To record operator mutations and automated audit triggers, execute <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 font-mono text-[11px]">database_migration_master.sql</code> in your Supabase SQL Editor.
          </div>
        </div>
      )}

      <AuditTable logs={logs} />
    </div>
  )
}
