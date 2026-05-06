import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { useUploadRemittance } from '../../hooks/useRemittances'
import { PageHeader } from '../../components/shared/PageHeader'
import { type UploadRemittanceResponse } from '../../data/remittance'

export function RemittanceUploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState<UploadRemittanceResponse | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { mutate: upload, isPending, error } = useUploadRemittance()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f && f.type === 'application/pdf') setFile(f)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    if (notes) formData.append('notes', notes)
    upload(formData, { onSuccess: (data) => setResult(data) })
  }

  if (result) {
    return (
      <div>
        <PageHeader title="Upload Remittance PDF" />
        <div className="max-w-lg mx-auto mt-8 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {result.duplicate && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Duplicate PDF</p>
                <p className="text-sm text-yellow-700 mt-1">This PDF has already been imported.</p>
                <button
                  onClick={() => navigate(`/remittances/imports/${result.importId}`)}
                  className="mt-2 text-sm text-yellow-800 underline"
                >
                  View existing import
                </button>
              </div>
            </div>
          )}

          {result.status === 'RECONCILIATION_FAILED' && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Reconciliation Failed</p>
                <p className="text-sm text-red-700 mt-1">The extracted amount does not match the expected payment total.</p>
                {result.errors?.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 mt-1">{e}</p>
                ))}
                <button
                  onClick={() => navigate(`/remittances/imports/${result.importId}`)}
                  className="mt-2 text-sm text-red-800 underline"
                >
                  View reconciliation details
                </button>
              </div>
            </div>
          )}

          {result.status === 'MISSING_RATES' && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800">Import Succeeded — Rates Missing</p>
                <p className="text-sm text-orange-700 mt-1">Some payable rows could not be computed. Configure provider rates before generating invoices.</p>
                <button
                  onClick={() => navigate(`/remittances/imports/${result.importId}/missing-rates`)}
                  className="mt-2 text-sm text-orange-800 underline"
                >
                  View missing rates
                </button>
              </div>
            </div>
          )}

          {result.status === 'READY_FOR_REVIEW' && !result.duplicate && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Import Successful</p>
                <p className="text-sm text-green-700 mt-1">The remittance has been parsed and is ready for review.</p>
              </div>
            </div>
          )}

          {result.summary && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                ['Total Rows', result.summary.totalRows],
                ['Paid Rows', result.summary.paidRows],
                ['Denied Rows', result.summary.deniedRows],
                ['Payable Rows', result.summary.payableRows],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate(`/remittances/imports/${result.importId}`)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              View Import
            </button>
            <button
              onClick={() => { setResult(null); setFile(null); setNotes('') }}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Upload Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Upload Remittance PDF" description="Upload a Medi-Cal remittance advice PDF to begin processing" />
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-4 space-y-5">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${file ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-white'}`}
        >
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-10 w-10 text-blue-500" />
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Upload className="h-10 w-10" />
              <p className="font-medium">Drop a PDF here, or click to browse</p>
              <p className="text-xs">Only PDF files are accepted</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Weekly batch May 5"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {(error as Error).message}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Remittance
            </>
          )}
        </button>
      </form>
    </div>
  )
}
