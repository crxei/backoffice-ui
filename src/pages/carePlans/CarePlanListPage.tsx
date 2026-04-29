import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Plus } from 'lucide-react'
import { useCarePlans } from '../../hooks/useCarePlans'
import { PageHeader } from '../../components/shared/PageHeader'
import { DataTable, type Column } from '../../components/shared/DataTable'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { type CarePlanListItem } from '../../data/carePlans'

const statusTabs = ['all', 'pending_approval', 'active', 'completed'] as const

const tabLabels: Record<string, string> = {
  all: 'All',
  pending_approval: 'Pending Approval',
  active: 'Active',
  completed: 'Completed',
}

export function CarePlanListPage() {
  const navigate = useNavigate()
  const { data: carePlans, isLoading } = useCarePlans()
  const [activeTab, setActiveTab] = useState<string>('all')

  if (isLoading) return <PageLoader />

  const all = carePlans ?? []
  const filtered = activeTab === 'all' ? all : all.filter((cp) => cp.status === activeTab)

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'id', header: 'ID', sortable: true },
    {
      key: 'patient',
      header: 'Patient',
      render: (r) => (
        <div>
          <span className="font-medium text-gray-900">{(r as unknown as CarePlanListItem).patient.name}</span>
          <p className="text-xs text-gray-400">{(r as unknown as CarePlanListItem).patient.mrn}</p>
        </div>
      ),
    },
    { key: 'title', header: 'Title', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={(r as unknown as CarePlanListItem).status} />,
    },
    {
      key: 'clinician',
      header: 'Clinician',
      render: (r) => (
        <span className="text-sm text-gray-600">{(r as unknown as CarePlanListItem).clinician.name}</span>
      ),
    },
    {
      key: 'targetDate',
      header: 'Target Date',
      sortable: true,
      render: (r) => {
        const cp = r as unknown as CarePlanListItem
        return cp.targetDate
          ? <span>{format(parseISO(cp.targetDate), 'MMM d, yyyy')}</span>
          : <span className="text-gray-400">—</span>
      },
    },
    {
      key: 'goals',
      header: 'Goals Progress',
      render: (r) => {
        const { goalsProgress: gp } = r as unknown as CarePlanListItem
        return (
          <div className="text-sm">
            <span className="font-medium text-green-700">{gp.achieved}</span>
            <span className="text-gray-400">/{gp.total} achieved</span>
            {gp.overdue > 0 && (
              <span className="ml-1.5 text-xs text-red-600">{gp.overdue} overdue</span>
            )}
          </div>
        )
      },
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/care-plans/${(r as unknown as CarePlanListItem).id}`) }}
          className="text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
        >
          View
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Care Plans"
        description={`${all.length} care plans`}
        actions={
          <button
            onClick={() => navigate('/care-plans/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Care Plan
          </button>
        }
      />

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4">
          {statusTabs.map((tab) => {
            const count = tab === 'all' ? all.length : all.filter((cp) => cp.status === tab).length
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tabLabels[tab]}{' '}
                <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered.map((cp) => ({ ...cp } as unknown as Record<string, unknown>))}
        searchable
        searchPlaceholder="Search care plans..."
        onRowClick={(r) => navigate(`/care-plans/${(r as unknown as CarePlanListItem).id}`)}
      />
    </div>
  )
}
