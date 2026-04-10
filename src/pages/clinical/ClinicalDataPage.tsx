import { useState } from 'react'
import { usePatients } from '../../hooks/usePatients'
import { useCarePlans } from '../../hooks/useCarePlans'
import { PageHeader } from '../../components/shared/PageHeader'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { DataTable, type Column } from '../../components/shared/DataTable'
import { type Patient } from '../../data/patients'

const observationsByPatient: Record<string, Array<{ date: string; type: string; value: string }>> = {
  'P-001': [
    { date: '2024-02-20', type: 'Blood Pressure', value: '128/82 mmHg' },
    { date: '2024-02-20', type: 'Weight', value: '182 lbs' },
    { date: '2024-02-20', type: 'Glucose (Fasting)', value: '142 mg/dL' },
    { date: '2024-01-15', type: 'A1C', value: '7.8%' },
    { date: '2024-01-15', type: 'eGFR', value: '48 mL/min' },
  ],
}

export function ClinicalDataPage() {
  const { data: patients } = usePatients()
  const { data: carePlans } = useCarePlans()
  const [selectedPatientId, setSelectedPatientId] = useState('')

  const selectedPatient = (patients ?? []).find((p) => p.id === selectedPatientId)
  const observations = observationsByPatient[selectedPatientId] ?? []
  const patientCPs = (carePlans ?? []).filter((cp) => cp.patientId === selectedPatientId)

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'mrn', header: 'MRN', sortable: true },
    {
      key: 'name',
      header: 'Patient',
      render: (r) => {
        const p = r as unknown as Patient
        return <span className="font-medium">{p.firstName} {p.lastName}</span>
      },
    },
    {
      key: 'riskLevel',
      header: 'Risk',
      render: (r) => <StatusBadge status={(r as unknown as Patient).riskLevel} />,
    },
    {
      key: 'conditions',
      header: 'Conditions',
      render: (r) => {
        const p = r as unknown as Patient
        return (
          <div className="flex flex-wrap gap-1">
            {p.conditions.slice(0, 2).map((c) => (
              <span key={c} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{c}</span>
            ))}
            {p.conditions.length > 2 && <span className="text-xs text-gray-500">+{p.conditions.length - 2}</span>}
          </div>
        )
      },
    },
    {
      key: 'actions',
      header: '',
      render: (r) => {
        const p = r as unknown as Patient
        return (
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedPatientId(p.id) }}
            className="text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
          >
            View Clinical
          </button>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Clinical Data" description="Patient observations, medications, and conditions" />

      <DataTable
        columns={columns}
        data={(patients ?? []).map((p) => ({ ...p } as unknown as Record<string, unknown>))}
        searchable
        searchPlaceholder="Search patients..."
        onRowClick={(r) => setSelectedPatientId((r as unknown as Patient).id)}
      />

      {selectedPatient && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Clinical Record — {selectedPatient.firstName} {selectedPatient.lastName}
            </h3>
            <button onClick={() => setSelectedPatientId('')} className="text-sm text-gray-400 hover:text-gray-600">Close</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Observations */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Observations</h4>
              {observations.length === 0 ? (
                <p className="text-sm text-gray-400">No recent observations recorded</p>
              ) : (
                <div className="space-y-2">
                  {observations.map((obs, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{obs.type}</p>
                        <p className="text-xs text-gray-500">{obs.date}</p>
                      </div>
                      <span className="font-mono text-gray-800">{obs.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Conditions */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Active Conditions</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPatient.conditions.map((c) => (
                  <span key={c} className="px-3 py-1.5 bg-blue-50 text-blue-800 text-sm font-medium rounded-full">{c}</span>
                ))}
              </div>

              {patientCPs.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Care Plans</h4>
                  {patientCPs.map((cp) => (
                    <div key={cp.id} className="p-3 bg-gray-50 rounded-lg mb-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{cp.title}</p>
                        <StatusBadge status={cp.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
