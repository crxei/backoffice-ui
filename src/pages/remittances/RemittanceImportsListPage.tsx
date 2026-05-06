import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Upload, Eye } from 'lucide-react'
import { useImports } from '../../hooks/useRemittances'
import { PageHeader } from '../../components/shared/PageHeader'
import { DataTable, type Column } from '../../components/shared/DataTable'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { type RemittanceImport } from '../../data/remittance'

const statusMap: Record<string, string> = {
  PROCESSING: 'in_progress',
  RECONCILIATION_FAILED: 'failed',
  MISSING_RATES: 'missing',
  READY_FOR_REVIEW: 'pending_approval',
  APPROVED: 'approved',
  EXPORTED: 'completed',
  PAID: 'paid',
}

export function RemittanceImportsListPage() {
  const navigate = useNavigate()
  const { data: imports, isLoading } = useImports()

  if (isLoading) return <PageLoader />

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'filename',
      header: 'File',
      render: (r) => <span className="font-medium text-gray-900">{(r as unknown as RemittanceImport).filename}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (r) => {
        const imp = r as unknown as RemittanceImport
        return <StatusBadge status={statusMap[imp.status] ?? imp.status.toLowerCase()} />
      },
    },
    {
      key: 'summary',
      header: 'Paid / Denied',
      render: (r) => {
        const imp = r as unknown as RemittanceImport
        return (
          <span className="text-sm text-gray-600">
            {imp.summary.paidRows} paid · {imp.summary.deniedRows} denied
          </span>
        )
      },
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      render: (r) => {
        const imp = r as unknown as RemittanceImport
        return <span>${imp.summary.extractedAmountPaid.toLocaleString()}</span>
      },
    },
    {
      key: 'passedAmountPaid',
      header: 'Reconciliation',
      render: (r) => {
        const imp = r as unknown as RemittanceImport
        return imp.summary.passedAmountPaid ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Passed</span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>
        )
      },
    },
    {
      key: 'createdAt',
      header: 'Imported',
      sortable: true,
      render: (r) => format(parseISO((r as unknown as RemittanceImport).createdAt), 'MMM d, yyyy'),
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (r) => (
        <span className="text-xs text-gray-500">{(r as unknown as RemittanceImport).notes ?? '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/remittances/imports/${(r as unknown as RemittanceImport).id}`)
          }}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
        >
          <Eye className="h-3.5 w-3.5" /> View
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Remittance Imports"
        description="Weekly Medi-Cal remittance batches"
        actions={
          <button
            onClick={() => navigate('/remittances/imports/upload')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload PDF
          </button>
        }
      />
      <DataTable
        columns={columns}
        data={(imports ?? []).map((i) => ({ ...i } as unknown as Record<string, unknown>))}
        searchable
        searchPlaceholder="Search imports..."
        onRowClick={(r) => navigate(`/remittances/imports/${(r as unknown as RemittanceImport).id}`)}
      />
    </div>
  )
}
