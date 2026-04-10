import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useClaims } from '../../hooks/useClaims'
import { usePatients } from '../../hooks/usePatients'
import { PageHeader } from '../../components/shared/PageHeader'
import { DataTable, type Column } from '../../components/shared/DataTable'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { type Claim } from '../../data/claims'

const arAgingData = [
  { bucket: '0–30 Days', Medicare: 4200, BCBS: 2800, Aetna: 1900, Medicaid: 800 },
  { bucket: '31–60 Days', Medicare: 2100, BCBS: 1400, Aetna: 900, Medicaid: 400 },
  { bucket: '61–90 Days', Medicare: 800, BCBS: 600, Aetna: 300, Medicaid: 200 },
  { bucket: '90+ Days', Medicare: 300, BCBS: 200, Aetna: 100, Medicaid: 50 },
]

export function ClaimsPage() {
  const { data: claims, isLoading } = useClaims()
  const { data: patients } = usePatients()
  const [activeTab, setActiveTab] = useState<'prior_auth' | 'claims' | 'ar'>('claims')

  if (isLoading) return <PageLoader />

  const getPatientName = (id: string) => {
    const p = (patients ?? []).find((x) => x.id === id)
    return p ? `${p.firstName} ${p.lastName}` : id
  }

  const claimsOnly = (claims ?? []).filter((c) => c.type === 'claim_submission')
  const paOnly = (claims ?? []).filter((c) => c.type === 'prior_auth')

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{getPatientName((r as unknown as Claim).patientId)}</span> },
    { key: 'payer', header: 'Payer', sortable: true },
    { key: 'procedureCode', header: 'Procedure' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={(r as unknown as Claim).status} /> },
    { key: 'submittedDate', header: 'Submitted', sortable: true, render: (r) => format(parseISO((r as unknown as Claim).submittedDate), 'MMM d, yyyy') },
    { key: 'amount', header: 'Amount', render: (r) => `$${((r as unknown as Claim).amount as number).toLocaleString()}` },
    { key: 'decisionNotes', header: 'Notes', render: (r) => <span className="text-xs text-gray-500 truncate max-w-[200px] block">{(r as unknown as Claim).decisionNotes}</span> },
  ]

  const paColumns: Column<Record<string, unknown>>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{getPatientName((r as unknown as Claim).patientId)}</span> },
    { key: 'payer', header: 'Payer', sortable: true },
    { key: 'procedureCode', header: 'Procedure' },
    { key: 'diagnosisCode', header: 'Diagnosis' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={(r as unknown as Claim).status} /> },
    { key: 'amount', header: 'Amount', render: (r) => `$${((r as unknown as Claim).amount as number).toLocaleString()}` },
  ]

  return (
    <div>
      <PageHeader title="Claims & Revenue Cycle" description="Manage claims submissions and AR aging" />

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4">
          {([['claims', 'Claims (837)'], ['prior_auth', 'Prior Auth'], ['ar', 'AR Aging']] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'claims' && (
        <DataTable
          columns={columns}
          data={claimsOnly.map((c) => ({ ...c } as unknown as Record<string, unknown>))}
          searchable
          searchPlaceholder="Search claims..."
        />
      )}

      {activeTab === 'prior_auth' && (
        <DataTable
          columns={paColumns}
          data={paOnly.map((c) => ({ ...c } as unknown as Record<string, unknown>))}
          searchable
          searchPlaceholder="Search PA requests..."
        />
      )}

      {activeTab === 'ar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">AR Aging by Payer</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={arAgingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => `$${v}`} />
                <Legend />
                <Bar dataKey="Medicare" fill="#3b82f6" radius={[3,3,0,0]} />
                <Bar dataKey="BCBS" fill="#10b981" radius={[3,3,0,0]} />
                <Bar dataKey="Aetna" fill="#f59e0b" radius={[3,3,0,0]} />
                <Bar dataKey="Medicaid" fill="#8b5cf6" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {arAgingData.map((b) => (
              <div key={b.bucket} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">{b.bucket}</p>
                <p className="text-xl font-bold text-gray-900">${Object.entries(b).filter(([k]) => k !== 'bucket').reduce((s, [, v]) => s + (v as number), 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
