import { format, parseISO } from 'date-fns'
import { GitBranch, AlertTriangle, Users, Activity, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useWorkflows } from '../../hooks/useWorkflows'
import { useRetryWorkflow } from '../../hooks/useWorkflows'
import { StatCard } from '../../components/shared/StatCard'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { toast } from '../../components/shared/Toast'

// Build chart data from last 7 days
function buildChartData(wfRuns: ReturnType<typeof useWorkflows>['data']) {
  const days: Record<string, { success: number; failed: number; label: string }> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days[key] = { success: 0, failed: 0, label: d.toLocaleDateString('en', { weekday: 'short' }) }
  }
  for (const run of wfRuns ?? []) {
    const key = run.triggeredAt.split('T')[0]
    if (days[key]) {
      if (run.status === 'success') days[key].success++
      else if (run.status === 'failed') days[key].failed++
    }
  }
  return Object.values(days)
}

export function AdminDashboard() {
  const { data: workflows, isLoading } = useWorkflows()
  const retryMutation = useRetryWorkflow()

  if (isLoading) return <PageLoader />

  const total24h = (workflows ?? []).length
  const successful = (workflows ?? []).filter((w) => w.status === 'success').length
  const failed = (workflows ?? []).filter((w) => w.status === 'failed')
  const successRate = total24h > 0 ? Math.round((successful / total24h) * 100) : 0
  const avgDuration = Math.round(
    (workflows ?? []).filter((w) => w.durationMs > 0).reduce((sum, w) => sum + w.durationMs, 0) /
    Math.max((workflows ?? []).filter((w) => w.durationMs > 0).length, 1)
  )

  const chartData = buildChartData(workflows)

  const handleRetry = async (id: string) => {
    try {
      await retryMutation.mutateAsync(id)
      toast('success', 'Workflow retried', 'Run re-queued successfully')
    } catch {
      toast('error', 'Retry failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Runs (24h)" value={total24h} icon={GitBranch} />
        <StatCard
          label="Success Rate"
          value={`${successRate}%`}
          icon={Activity}
          variant={successRate >= 90 ? 'success' : successRate >= 70 ? 'warning' : 'danger'}
        />
        <StatCard label="Failed Runs" value={failed.length} icon={AlertTriangle} variant={failed.length > 2 ? 'danger' : 'default'} />
        <StatCard label="Avg Duration (ms)" value={avgDuration} />
        <StatCard
          label="System Health"
          value={failed.length > 5 ? 'Degraded' : 'Online'}
          variant={failed.length > 5 ? 'danger' : 'success'}
          icon={Users}
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Workflow Runs — Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="success" name="Success" fill="#22c55e" radius={[3, 3, 0, 0]} />
            <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Failed Runs */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Failed Workflow Runs</h3>
        {failed.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No failed runs</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="pb-3 pr-4">Run ID</th>
                  <th className="pb-3 pr-4">Workflow</th>
                  <th className="pb-3 pr-4">Triggered</th>
                  <th className="pb-3 pr-4">Error</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {failed.slice(0, 5).map((run) => (
                  <tr key={run.id}>
                    <td className="py-3 pr-4 text-xs font-mono text-gray-600">{run.id}</td>
                    <td className="py-3 pr-4 text-sm text-gray-900">{run.workflowName}</td>
                    <td className="py-3 pr-4 text-xs text-gray-500">
                      {format(parseISO(run.triggeredAt), 'MMM d, HH:mm')}
                    </td>
                    <td className="py-3 pr-4 text-xs text-red-600 max-w-xs truncate">{run.errorMessage}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleRetry(run.id)}
                        className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
                      >
                        <RefreshCw className="h-3 w-3" /> Retry
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Active User Sessions</h3>
        <div className="space-y-2">
          {[
            { name: 'Sarah Chen', role: 'Care Coordinator', lastActive: '2 min ago', ip: '10.0.1.12' },
            { name: 'Dr. James Okafor', role: 'Clinician', lastActive: '8 min ago', ip: '10.0.1.45' },
            { name: 'Maria Rodriguez', role: 'CHW Supervisor', lastActive: '15 min ago', ip: '10.0.1.78' },
          ].map((session) => (
            <div key={session.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{session.name}</p>
                  <p className="text-xs text-gray-500">{session.role} · {session.ip}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{session.lastActive}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
