import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ChevronLeft, Download, FileText } from 'lucide-react'
import { useInvoicePreview, useDownloadInvoicePdf, useDownloadInvoiceCsv } from '../../hooks/useProviderInvoices'
import { PageHeader } from '../../components/shared/PageHeader'
import { PageLoader } from '../../components/shared/LoadingSpinner'

const today = format(new Date(), 'yyyy-MM-dd')
const nextWeek = format(new Date(Date.now() + 7 * 86400000), 'yyyy-MM-dd')

export function ProviderInvoicePreviewPage() {
  const { importId, serviceProviderId } = useParams<{ importId: string; serviceProviderId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const paymentDate = searchParams.get('paymentDate') ?? today
  const paidOnDate = searchParams.get('paidOnDate') ?? nextWeek

  const params = { importId: importId!, serviceProviderId: serviceProviderId!, paymentDate, paidOnDate }

  const { data: invoice, isLoading } = useInvoicePreview(params)
  const { mutate: downloadPdf, isPending: pdfPending } = useDownloadInvoicePdf()
  const { mutate: downloadCsv, isPending: csvPending } = useDownloadInvoiceCsv()

  if (isLoading) return <PageLoader />
  if (!invoice) return <div className="text-gray-500 p-6">Invoice not found.</div>

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate(`/remittances/imports/${importId}/provider-summary`)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Provider Summary
        </button>
      </div>

      <PageHeader
        title={`Invoice — ${invoice.employeeName}`}
        description={`${invoice.teamName} · Payment Date: ${paymentDate} · Paid On: ${paidOnDate}`}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => downloadPdf(params)}
              disabled={pdfPending}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              {pdfPending ? 'Downloading…' : 'Download PDF'}
            </button>
            <button
              onClick={() => downloadCsv(params)}
              disabled={csvPending}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {csvPending ? 'Downloading…' : 'Download CSV'}
            </button>
          </div>
        }
      />

      {/* Summary header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5 flex flex-wrap gap-6">
        {[
          { label: 'Provider', value: invoice.employeeName },
          { label: 'Organization', value: invoice.teamName },
          { label: 'Payment Date', value: paymentDate },
          { label: 'Paid On', value: paidOnDate },
          { label: 'Total Paid Amount', value: invoice.totalPaidAmount },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-semibold text-gray-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Paid services */}
      <div className="bg-white rounded-xl border border-gray-200 mb-5">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Paid Services</h3>
          <span className="text-sm text-gray-500">{invoice.paidServices.length} line(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Date of Service', 'Patient', 'TCN', 'Units', 'Hours', 'Rate', 'Payment', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.paidServices.map((s) => (
                <tr key={s.tcn} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{s.dateOfService}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.patientName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{s.tcn}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.units}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.hours}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.rate}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{s.payment}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      PAID
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={6} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                  Total
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{invoice.totalPaidAmount}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Denied services */}
      {invoice.deniedServices.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Denied Services</h3>
            <span className="text-sm text-gray-500">{invoice.deniedServices.length} line(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Date of Service', 'Patient', 'TCN', 'EOB Code', 'Reason', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.deniedServices.map((s) => (
                  <tr key={s.tcn} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{s.dateOfService}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.patientName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{s.tcn}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{s.eobCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.reason}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        DENIED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
