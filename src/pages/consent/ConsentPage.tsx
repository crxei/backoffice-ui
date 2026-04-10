import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Plus, AlertTriangle } from 'lucide-react'
import { useConsents, useCreateConsent } from '../../hooks/useConsents'
import { usePatients } from '../../hooks/usePatients'
import { PageHeader } from '../../components/shared/PageHeader'
import { DataTable, type Column } from '../../components/shared/DataTable'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { toast } from '../../components/shared/Toast'
import { type Consent } from '../../data/consents'

export function ConsentPage() {
  const { data: consents, isLoading } = useConsents()
  const { data: patients } = usePatients()
  const createMutation = useCreateConsent()
  const [activeTab, setActiveTab] = useState<'all' | 'alerts'>('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ patientId: '', type: 'treatment' as Consent['type'], signedBy: '', witnessedBy: '' })
  const [submitting, setSubmitting] = useState(false)

  if (isLoading) return <PageLoader />

  const getPatientName = (id: string) => {
    const p = (patients ?? []).find((x) => x.id === id)
    return p ? `${p.firstName} ${p.lastName}` : id
  }

  const alerts = (consents ?? []).filter((c) => c.status === 'expired' || c.status === 'pending')
  const display = activeTab === 'alerts' ? alerts : (consents ?? [])

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{getPatientName((r as unknown as Consent).patientId)}</span> },
    { key: 'type', header: 'Consent Type', render: (r) => <span className="capitalize">{(r as unknown as Consent).type}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={(r as unknown as Consent).status} /> },
    { key: 'signedDate', header: 'Signed Date', sortable: true, render: (r) => {
      const d = (r as unknown as Consent).signedDate
      return d ? format(parseISO(d), 'MMM d, yyyy') : '—'
    }},
    { key: 'expiryDate', header: 'Expiry Date', sortable: true, render: (r) => format(parseISO((r as unknown as Consent).expiryDate), 'MMM d, yyyy') },
    { key: 'signedBy', header: 'Signed By', render: (r) => (r as unknown as Consent).signedBy || '—' },
    { key: 'witnessedBy', header: 'Witnessed By', render: (r) => (r as unknown as Consent).witnessedBy || '—' },
  ]

  const handleRecord = async () => {
    if (!form.patientId || !form.type) { toast('error', 'Fill all required fields'); return }
    setSubmitting(true)
    try {
      const today = new Date()
      const expiry = new Date(today)
      expiry.setFullYear(expiry.getFullYear() + 2)
      await createMutation.mutateAsync({
        patientId: form.patientId,
        type: form.type,
        status: 'active',
        signedDate: today.toISOString().split('T')[0],
        expiryDate: expiry.toISOString().split('T')[0],
        signedBy: form.signedBy,
        witnessedBy: form.witnessedBy,
      })
      toast('success', 'Consent Recorded')
      setShowModal(false)
      setForm({ patientId: '', type: 'treatment', signedBy: '', witnessedBy: '' })
    } catch { toast('error', 'Recording Failed') }
    setSubmitting(false)
  }

  return (
    <div>
      <PageHeader
        title="Consent Management"
        description={`${alerts.length} alerts — ${(consents ?? []).filter((c) => c.status === 'active').length} active consents`}
        actions={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Record Consent
          </button>
        }
      />

      {alerts.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-800 font-medium">{alerts.length} patients have expired or missing consent forms requiring action</p>
        </div>
      )}

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4">
          {(['all', 'alerts'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab === 'all' ? 'All Consents' : `Alerts (${alerts.length})`}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={display.map((c) => ({ ...c } as unknown as Record<string, unknown>))}
        searchable
        searchPlaceholder="Search consent records..."
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-4">Record Consent</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select patient</option>
                  {(patients ?? []).map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consent Type *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Consent['type'] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['treatment', 'payment', 'operations', 'roi', 'research'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signed By</label>
                <input value={form.signedBy} onChange={(e) => setForm({ ...form, signedBy: e.target.value })} placeholder="Patient name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Witnessed By</label>
                <input value={form.witnessedBy} onChange={(e) => setForm({ ...form, witnessedBy: e.target.value })} placeholder="Staff name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleRecord} disabled={submitting} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70">
                {submitting && <LoadingSpinner size="sm" />} Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
