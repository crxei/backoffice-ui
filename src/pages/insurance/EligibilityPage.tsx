import { useState } from 'react'
import { usePatients } from '../../hooks/usePatients'
import { PageHeader } from '../../components/shared/PageHeader'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { type Patient } from '../../data/patients'

interface EligibilityResult {
  patient: Patient
  coverageStatus: 'active' | 'inactive'
  planName: string
  groupNumber: string
  memberId: string
  deductibleMet: number
  deductibleTotal: number
  oopMet: number
  oopTotal: number
  primaryCareCopay: number
  specialistCopay: number
  networkStatus: 'in-network' | 'out-of-network'
}

const historyItems = [
  { patient: 'Eleanor Voss', date: '2024-02-28', status: 'active', payer: 'Medicare' },
  { patient: 'Linda Kowalski', date: '2024-02-27', status: 'active', payer: 'Medicare' },
  { patient: 'Patricia Nguyen', date: '2024-02-26', status: 'active', payer: 'United Healthcare' },
  { patient: 'Marcus Whitfield', date: '2024-02-25', status: 'active', payer: 'BlueCross BlueShield' },
  { patient: 'Yolanda Hernandez', date: '2024-02-24', status: 'inactive', payer: 'Medicaid' },
]

export function EligibilityPage() {
  const { data: patients } = usePatients()
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<EligibilityResult | null>(null)

  const runCheck = async () => {
    if (!selectedPatientId) return
    setChecking(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 1200))
    const patient = (patients ?? []).find((p) => p.id === selectedPatientId)
    if (!patient) { setChecking(false); return }
    setResult({
      patient,
      coverageStatus: Math.random() > 0.15 ? 'active' : 'inactive',
      planName: patient.insurance.plan,
      groupNumber: patient.insurance.groupNumber,
      memberId: patient.insurance.memberId,
      deductibleMet: Math.floor(Math.random() * 2000),
      deductibleTotal: 3000,
      oopMet: Math.floor(Math.random() * 4000),
      oopTotal: 6000,
      primaryCareCopay: [0, 10, 20, 25, 30][Math.floor(Math.random() * 5)],
      specialistCopay: [20, 40, 50, 60][Math.floor(Math.random() * 4)],
      networkStatus: Math.random() > 0.2 ? 'in-network' : 'out-of-network',
    })
    setChecking(false)
  }

  return (
    <div>
      <PageHeader title="Insurance & Eligibility" description="Verify patient insurance coverage in real-time" />

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex gap-3">
          <select
            value={selectedPatientId}
            onChange={(e) => { setSelectedPatientId(e.target.value); setResult(null) }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a patient to check eligibility...</option>
            {(patients ?? []).map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.mrn} ({p.insurance.payer})</option>)}
          </select>
          <button
            onClick={runCheck}
            disabled={!selectedPatientId || checking}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {checking && <LoadingSpinner size="sm" />}
            {checking ? 'Checking...' : 'Run Eligibility Check'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900">{result.patient.firstName} {result.patient.lastName}</h3>
              <p className="text-sm text-gray-500">{result.patient.insurance.payer}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={result.coverageStatus} />
              <StatusBadge status={result.networkStatus} />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Plan Name</p><p className="font-medium">{result.planName}</p></div>
            <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Member ID</p><p className="font-medium">{result.memberId}</p></div>
            <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Group Number</p><p className="font-medium">{result.groupNumber}</p></div>
            <div className="bg-blue-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Deductible</p><p className="font-medium text-blue-800">${result.deductibleMet} met of ${result.deductibleTotal}</p></div>
            <div className="bg-blue-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Out-of-Pocket Max</p><p className="font-medium text-blue-800">${result.oopMet} met of ${result.oopTotal}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Copay</p><p className="font-medium text-green-800">${result.primaryCareCopay} PCP / ${result.specialistCopay} Specialist</p></div>
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Eligibility Checks</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead><tr className="text-left text-xs text-gray-500 uppercase"><th className="pb-2 pr-4">Patient</th><th className="pb-2 pr-4">Date</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Payer</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {historyItems.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-2 pr-4 font-medium">{item.patient}</td>
                  <td className="py-2 pr-4 text-gray-500">{item.date}</td>
                  <td className="py-2 pr-4"><StatusBadge status={item.status} /></td>
                  <td className="py-2 text-gray-600">{item.payer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
