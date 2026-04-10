import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useWorkflows, useRetryWorkflow } from '../../hooks/useWorkflows'
import { PageHeader } from '../../components/shared/PageHeader'
import { StatCard } from '../../components/shared/StatCard'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { DataTable, type Column } from '../../components/shared/DataTable'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { toast } from '../../components/shared/Toast'
import { type WorkflowRun } from '../../data/workflows'

export function OpenFnMonitorPage() {
  const { data: runs, isLoading } = useWorkflows()
  const retryMutation = useRetryWorkflow()
  const [wfFilter, setWfFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  if (isLoading) return <PageLoader />

  const total = (runs ?? []).length
  const successful = (runs ?? []).filter((r) => r.status === 'success').length
  const failed = (runs ?? []).filter((r) => r.status === 'failed').length
  const successRate = total > 0 ? Math.round((successful / total) * 100) : 0
  const avgDuration = Math.round(
    (runs ?? []).filter((r) => r.durationMs > 0).reduce((s, r) => s + r.durationMs, 0) /
    Math.max((runs ?? []).filter((r) => r.durationMs > 0).length, 1)
  )

  const workflowNames = [...new Set((runs ?? []).map((r) => r.workflowName))].sort()

  // Build 7-day chart
  const days: Record<string, { label: string; success: number; failed: number }> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days[key] = { label: d.toLocaleDateString('en', { weekday: 'short' }), success: 0, failed: 0 }
  }
  for (const run of runs ?? []) {
    const key = run.triggeredAt.split('T')[0]
    if (days[key]) {
      if (run.status === 'success') days[key].success++
      else if (run.status === 'failed') days[key].failed++
    }
  }
  const chartData = Object.values(days)

  const filtered = (runs ?? []).filter((r) => {
    if (wfFilter && r.workflowName !== wfFilter) return false
    if (statusFilter && r.status !== statusFilter) return false
    return true
  })

  const handleRetry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await retryMutation.mutateAsync(id)
      toast('success', 'Workflow retried')
    } catch { toast('error', 'Retry failed') }
  }

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'id', header: 'Run ID', sortable: true, render: (r) => <span className="font-mono text-xs">{(r as unknown as WorkflowRun).id}</span> },
    { key: 'workflowName', header: 'Workflow', sortable: true },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={(r as unknown as WorkflowRun).status} /> },
    { key: 'triggeredAt', header: 'Triggered', sortable: true, render: (r) => format(parseISO((r as unknown as WorkflowRun).triggeredAt), 'MMM d, HH:mm') },
    { key: 'durationMs', header: 'Duration', render: (r) => {
      const d = (r as unknown as WorkflowRun).durationMs
      return d ? `${d}ms` : '—'
    }},
    { key: 'inputSummary', header: 'Input', render: (r) => <span className="text-xs text-gray-500 max-w-[160px] truncate block">{(r as unknown as WorkflowRun).inputSummary}</span> },
    { key: 'errorMessage', header: 'Error', render: (r) => {
      const err = (r as unknown as WorkflowRun).errorMessage
      return err ? <span className="text-xs text-red-600 max-w-[160px] truncate block">{err}</span> : <span className="text-gray-400 text-xs">—</span>
    }},
    { key: 'actions', header: '', render: (r) => {
      const run = r as unknown as WorkflowRun
      return run.status === 'failed' ? (
        <button onClick={(e) => handleRetry(run.id, e)} className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50">
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      ) : null
    }},
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="OpenFn Monitor" description="Real-time workflow execution monitoring" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Runs (24h)" value={total} />
        <StatCard label="Success Rate" value={`${successRate}%`} variant={successRate >= 90 ? 'success' : successRate >= 70 ? 'warning' : 'danger'} />
        <StatCard label="Failed Runs" value={failed} variant={failed > 2 ? 'danger' : 'default'} />
        <StatCard label="Avg Duration (ms)" value={avgDuration} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Run History — Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="success" name="Success" fill="#22c55e" radius={[3,3,0,0]} />
            <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <DataTable
        columns={columns}
        data={filtered.map((r) => ({ ...r } as unknown as Record<string, unknown>))}
        searchable
        searchPlaceholder="Search workflow runs..."
        extraFilters={
          <div className="flex gap-2">
            <select value={wfFilter} onChange={(e) => setWfFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Workflows</option>
              {workflowNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              {['success', 'failed', 'running', 'retrying'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        }
      />
    </div>
  )
}
