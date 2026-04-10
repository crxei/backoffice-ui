import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Plus } from 'lucide-react'
import { useClaims, useUpdateClaim } from '../../hooks/useClaims'
import { usePatients } from '../../hooks/usePatients'
import { PageHeader } from '../../components/shared/PageHeader'
import { DataTable, type Column } from '../../components/shared/DataTable'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { toast } from '../../components/shared/Toast'
import { type Claim } from '../../data/claims'

const statusTabs = ['all', 'pending', 'approved', 'denied', 'appealing'] as const

export function PriorAuthPage() {
  const navigate = useNavigate()
  const { data: claims, isLoading } = useClaims()
  const { data: patients } = usePatients()
  const updateMutation = useUpdateClaim()
  const [activeTab, setActiveTab] = useState<string>('all')

  if (isLoading) return <PageLoader />

  const paOnly = (claims ?? []).filter((c) => c.type === 'prior_auth')
  const filtered = activeTab === 'all' ? paOnly : paOnly.filter((c) => c.status === activeTab)

  const getPatientName = (id: string) => {
    const p = (patients ?? []).find((x) => x.id === id)
    return p ? `${p.firstName} ${p.lastName}` : id
  }

  const handleAppeal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await updateMutation.mutateAsync({ id, data: { status: 'appealing', submittedDate: new Date().toISOString().split('T')[0] } })
      toast('success', 'Appeal Submitted')
    } catch { toast('error', 'Appeal Failed') }
  }

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{getPatientName((r as unknown as Claim).patientId)}</span> },
    { key: 'payer', header: 'Payer', sortable: true },
    { key: 'procedureCode', header: 'Procedure Code' },
    { key: 'diagnosisCode', header: 'Diagnosis Code' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={(r as unknown as Claim).status} /> },
    { key: 'submittedDate', header: 'Submitted', sortable: true, render: (r) => format(parseISO((r as unknown as Claim).submittedDate), 'MMM d, yyyy') },
    { key: 'decisionDate', header: 'Decision', render: (r) => {
      const d = (r as unknown as Claim).decisionDate
      return d ? format(parseISO(d), 'MMM d, yyyy') : '—'
    }},
    { key: 'amount', header: 'Amount', render: (r) => `$${((r as unknown as Claim).amount as number).toLocaleString()}` },
    { key: 'actions', header: '', render: (r) => {
      const c = r as unknown as Claim
      return (
        <div className="flex gap-1">
          {c.status === 'denied' && (
            <button onClick={(e) => handleAppeal(c.id, e)} className="text-xs text-orange-600 border border-orange-200 px-2 py-1 rounded hover:bg-orange-50">Appeal</button>
          )}
          <span className="text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded cursor-default">View</span>
        </div>
      )
    }},
  ]

  const tabLabels: Record<string, string> = { all: 'All', pending: 'Pending', approved: 'Approved', denied: 'Denied', appealing: 'Appealing' }

  return (
    <div>
      <PageHeader
        title="Prior Authorization"
        description={`${paOnly.length} PA requests`}
        actions={
          <button onClick={() => navigate('/prior-auth/new')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New PA Request
          </button>
        }
      />

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4">
          {statusTabs.map((tab) => {
            const count = tab === 'all' ? paOnly.length : paOnly.filter((c) => c.status === tab).length
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tabLabels[tab]} <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered.map((c) => ({ ...c } as unknown as Record<string, unknown>))}
        searchable
        searchPlaceholder="Search PA requests..."
      />
    </div>
  )
}
