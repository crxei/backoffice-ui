import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useRates, useDeleteRate } from '../../hooks/useRates'
import { PageHeader } from '../../components/shared/PageHeader'
import { DataTable, type Column } from '../../components/shared/DataTable'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { type ProviderRate, type RateType } from '../../data/rates'

const RATE_TYPE_LABELS: Record<RateType, string> = {
  PER_UNIT: 'Per Unit',
  PER_HOUR: 'Per Hour',
  PERCENT_OF_PAID: '% of Paid',
  FLAT: 'Flat',
}

export function RatesListPage() {
  const navigate = useNavigate()
  const [activeOnly, setActiveOnly] = useState(false)
  const [rateTypeFilter, setRateTypeFilter] = useState('')
  const { data: rates, isLoading } = useRates(activeOnly ? { active: true } : undefined)
  const { mutate: deleteRate, isPending: deleting } = useDeleteRate()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (isLoading) return <PageLoader />

  const filtered = rateTypeFilter
    ? (rates ?? []).filter((r) => r.rateType === rateTypeFilter)
    : (rates ?? [])

  function formatRate(r: ProviderRate) {
    if (r.rateType === 'PERCENT_OF_PAID') return `${r.rate}%`
    return `$${r.rate.toFixed(2)}`
  }

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'serviceProviderName', header: 'Provider', sortable: true },
    { key: 'serviceProviderId', header: 'Provider ID' },
    { key: 'serviceCode', header: 'Service Code', sortable: true },
    {
      key: 'modifiers',
      header: 'Modifiers',
      render: (r) => <span>{(r as unknown as ProviderRate).modifiers || '—'}</span>,
    },
    {
      key: 'rateType',
      header: 'Rate Type',
      sortable: true,
      render: (r) => (
        <span className="text-sm">{RATE_TYPE_LABELS[(r as unknown as ProviderRate).rateType]}</span>
      ),
    },
    {
      key: 'rate',
      header: 'Rate',
      sortable: true,
      render: (r) => <span className="font-medium">{formatRate(r as unknown as ProviderRate)}</span>,
    },
    {
      key: 'effectiveFrom',
      header: 'Effective From',
      sortable: true,
    },
    {
      key: 'effectiveTo',
      header: 'Effective To',
      render: (r) => <span>{(r as unknown as ProviderRate).effectiveTo ?? '—'}</span>,
    },
    {
      key: 'active',
      header: 'Active',
      render: (r) => (
        <StatusBadge status={(r as unknown as ProviderRate).active ? 'active' : 'archived'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => {
        const rate = r as unknown as ProviderRate
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/rates/${rate.id}/edit`) }}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(rate.id) }}
              className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Provider Rates"
        description="Configure rates used for provider payment calculation and invoice generation"
        actions={
          <button
            onClick={() => navigate('/rates/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Rate
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={filtered.map((r) => ({ ...r } as unknown as Record<string, unknown>))}
        searchable
        searchPlaceholder="Search rates…"
        extraFilters={
          <div className="flex items-center gap-3">
            <select
              value={rateTypeFilter}
              onChange={(e) => setRateTypeFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Rate Types</option>
              {Object.entries(RATE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Active only
            </label>
          </div>
        }
        onRowClick={(r) => navigate(`/rates/${(r as unknown as ProviderRate).id}/edit`)}
      />

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Rate</h3>
            <p className="text-sm text-gray-600 mb-5">Are you sure you want to delete this rate? This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  deleteRate(confirmDelete)
                  setConfirmDelete(null)
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
