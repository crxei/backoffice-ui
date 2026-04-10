import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { differenceInYears, parseISO } from 'date-fns'
import { Plus } from 'lucide-react'
import { usePatients } from '../../hooks/usePatients'
import { PageHeader } from '../../components/shared/PageHeader'
import { DataTable, type Column } from '../../components/shared/DataTable'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { type Patient } from '../../data/patients'
import { providers } from '../../data/providers'

export function PatientListPage() {
  const navigate = useNavigate()
  const { data: patients, isLoading } = usePatients()
  const [riskFilter, setRiskFilter] = useState('')
  const [payerFilter, setPayerFilter] = useState('')
  const [consentFilter, setConsentFilter] = useState('')

  if (isLoading) return <PageLoader />

  const payers = [...new Set((patients ?? []).map((p) => p.insurance.payer))].sort()

  const filtered = (patients ?? []).filter((p) => {
    if (riskFilter && p.riskLevel !== riskFilter) return false
    if (payerFilter && p.insurance.payer !== payerFilter) return false
    if (consentFilter && p.consentStatus !== consentFilter) return false
    return true
  })

  const getProviderName = (id: string) => providers.find((pr) => pr.id === id)?.name ?? id

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'mrn', header: 'MRN', sortable: true },
    {
      key: 'name',
      header: 'Patient',
      render: (row) => {
        const p = row as unknown as Patient
        return (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
              {p.firstName[0]}{p.lastName[0]}
            </div>
            <span className="font-medium text-gray-900">{p.firstName} {p.lastName}</span>
          </div>
        )
      },
    },
    {
      key: 'dob',
      header: 'Age / DOB',
      sortable: true,
      render: (row) => {
        const p = row as unknown as Patient
        return <span>{differenceInYears(new Date(), parseISO(p.dob))}y · {p.dob}</span>
      },
    },
    { key: 'phone', header: 'Phone' },
    {
      key: 'insurance',
      header: 'Insurance',
      render: (row) => {
        const p = row as unknown as Patient
        return <span className="text-sm">{p.insurance.payer}</span>
      },
    },
    {
      key: 'riskLevel',
      header: 'Risk',
      sortable: true,
      render: (row) => <StatusBadge status={(row as unknown as Patient).riskLevel} />,
    },
    {
      key: 'consentStatus',
      header: 'Consent',
      render: (row) => <StatusBadge status={(row as unknown as Patient).consentStatus} />,
    },
    {
      key: 'primaryProvider',
      header: 'Provider',
      render: (row) => <span className="text-sm text-gray-600">{getProviderName((row as unknown as Patient).primaryProvider)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/patients/${(row as unknown as Patient).id}`) }}
          className="text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
        >
          View
        </button>
      ),
    },
  ]

  const tableData = filtered.map((p) => ({ ...p } as unknown as Record<string, unknown>))

  return (
    <div>
      <PageHeader
        title="Patient Registry"
        description={`${(patients ?? []).length} patients enrolled`}
        actions={
          <button
            onClick={() => navigate('/patients/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Register New Patient
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={tableData}
        searchable
        searchPlaceholder="Search by name, MRN, email..."
        onRowClick={(row) => navigate(`/patients/${(row as unknown as Patient).id}`)}
        extraFilters={
          <div className="flex flex-wrap gap-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Risk Levels</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={payerFilter}
              onChange={(e) => setPayerFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payers</option>
              {payers.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={consentFilter}
              onChange={(e) => setConsentFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Consent Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="missing">Missing</option>
            </select>
          </div>
        }
      />
    </div>
  )
}
