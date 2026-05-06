import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'
import { useMissingRates, useImport } from '../../hooks/useRemittances'
import { PageHeader } from '../../components/shared/PageHeader'
import { DataTable, type Column } from '../../components/shared/DataTable'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { type MissingRate } from '../../data/remittance'

export function MissingRatesPage() {
  const { importId } = useParams<{ importId: string }>()
  const navigate = useNavigate()
  const { data: imp } = useImport(importId!)
  const { data: missing, isLoading } = useMissingRates(importId!)

  if (isLoading) return <PageLoader />

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'serviceCode', header: 'Service Code', sortable: true },
    { key: 'dateOfService', header: 'Date of Service', sortable: true },
    { key: 'units', header: 'Units' },
    {
      key: 'amountPaid',
      header: 'Amount Paid',
      render: (r) => `$${((r as unknown as MissingRate).amountPaid).toLocaleString()}`,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => {
        const m = r as unknown as MissingRate
        const params = new URLSearchParams({ serviceCode: m.serviceCode })
        return (
          <Link
            to={`/rates/new?${params}`}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" /> Add Rate
          </Link>
        )
      },
    },
  ]

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate(`/remittances/imports/${importId}`)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Import
        </button>
      </div>

      <PageHeader
        title="Missing Rates"
        description={imp ? `${imp.filename} — ${missing?.length ?? 0} service code(s) need rates configured` : 'Missing rates for this import'}
        actions={
          <Link
            to="/rates/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Rate
          </Link>
        }
      />

      {missing?.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <p className="font-medium text-green-800">All rates are configured.</p>
          <p className="text-sm text-green-700 mt-1">You can now generate provider invoices.</p>
          <Link
            to={`/remittances/imports/${importId}/provider-summary`}
            className="mt-4 inline-block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
          >
            View Provider Summary
          </Link>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={(missing ?? []).map((m) => ({ ...m } as unknown as Record<string, unknown>))}
          searchable
          searchPlaceholder="Search missing rates…"
          keyField="serviceCode"
        />
      )}
    </div>
  )
}
