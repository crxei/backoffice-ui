import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ChevronLeft, FileText, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useProviderSummary, useImport } from '../../hooks/useRemittances'
import { useDownloadInvoicePdf } from '../../hooks/useProviderInvoices'
import { PageHeader } from '../../components/shared/PageHeader'
import { DataTable, type Column } from '../../components/shared/DataTable'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { type ProviderSummaryRow } from '../../data/remittance'

const today = format(new Date(), 'yyyy-MM-dd')
const nextWeek = format(new Date(Date.now() + 7 * 86400000), 'yyyy-MM-dd')

export function ProviderSummaryPage() {
  const { importId } = useParams<{ importId: string }>()
  const navigate = useNavigate()
  const { data: imp } = useImport(importId!)
  const { data: summary, isLoading } = useProviderSummary(importId!)
  const { mutate: downloadPdf, isPending: pdfPending } = useDownloadInvoicePdf()

  const [paymentDate, setPaymentDate] = useState(today)
  const [paidOnDate, setPaidOnDate] = useState(nextWeek)

  if (isLoading) return <PageLoader />

  const totalPaid = (summary ?? []).reduce((s, r) => s + r.totalAmountPaid, 0)
  const totalComputed = (summary ?? []).reduce((s, r) => s + r.computedProviderPayment, 0)
  const hasMissingRates = (summary ?? []).some((r) => r.missingRateCount > 0)

  function downloadExcel() {
    const rows = (summary ?? []).map((r) => ({
      'Provider': r.serviceProviderName,
      'Provider ID': r.serviceProviderId,
      'Paid Lines': r.paidLines,
      'Denied Lines': r.deniedLines,
      'Total Units': r.totalUnits,
      'Amount Paid': r.totalAmountPaid,
      'Provider Payment': r.computedProviderPayment,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Provider Summary')
    const filename = imp?.filename
      ? `provider-summary-${imp.filename.replace('.pdf', '')}.xlsx`
      : 'provider-summary.xlsx'
    XLSX.writeFile(wb, filename)
  }

  const invoiceParams = (row: ProviderSummaryRow) => ({
    importId: importId!,
    serviceProviderId: row.serviceProviderId,
    paymentDate,
    paidOnDate,
  })

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'serviceProviderName', header: 'Provider', sortable: true },
    { key: 'serviceProviderId', header: 'Provider ID' },
    { key: 'paidLines', header: 'Paid Lines', sortable: true },
    { key: 'deniedLines', header: 'Denied Lines', sortable: true },
    { key: 'totalUnits', header: 'Total Units', sortable: true },
    {
      key: 'totalAmountPaid',
      header: 'Amount Paid',
      sortable: true,
      render: (r) => `$${((r as unknown as ProviderSummaryRow).totalAmountPaid).toLocaleString()}`,
    },
    {
      key: 'computedProviderPayment',
      header: 'Provider Payment',
      sortable: true,
      render: (r) => {
        const row = r as unknown as ProviderSummaryRow
        return row.missingRateCount > 0 ? (
          <span className="text-orange-600 text-sm font-medium">Missing {row.missingRateCount} rate(s)</span>
        ) : (
          `$${row.computedProviderPayment.toLocaleString()}`
        )
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => {
        const row = r as unknown as ProviderSummaryRow
        const params = invoiceParams(row)
        const disabled = row.missingRateCount > 0
        return (
          <button
            disabled={disabled || pdfPending}
            onClick={() => downloadPdf(params)}
            className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30"
          >
            <FileText className="h-3.5 w-3.5" /> PDF
          </button>
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
        title="Provider Summary"
        description={imp?.filename}
        actions={
          <button
            onClick={downloadExcel}
            disabled={!summary?.length}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Download Excel
          </button>
        }
      />

      {hasMissingRates && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800 flex items-center justify-between">
          <span>Some providers have missing rates. Resolve them before generating invoices.</span>
          <Link to={`/remittances/imports/${importId}/missing-rates`} className="underline font-medium ml-4">
            Fix rates
          </Link>
        </div>
      )}

      {/* Date controls */}
      <div className="flex gap-4 mb-6 bg-white rounded-xl border border-gray-200 p-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Payment Date</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Paid On Date</label>
          <input
            type="date"
            value={paidOnDate}
            onChange={(e) => setPaidOnDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Providers', value: (summary ?? []).length },
          { label: 'Total Paid Lines', value: (summary ?? []).reduce((s, r) => s + r.paidLines, 0) },
          { label: 'Total Amount Paid', value: `$${totalPaid.toLocaleString()}` },
          { label: 'Total Provider Payment', value: hasMissingRates ? '—' : `$${totalComputed.toLocaleString()}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={(summary ?? []).map((r) => ({ ...r } as unknown as Record<string, unknown>))}
        keyField="serviceProviderId"
      />
    </div>
  )
}
