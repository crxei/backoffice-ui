import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Plus } from 'lucide-react'
import { useReferrals } from '../../hooks/useReferrals'
import { usePatients } from '../../hooks/usePatients'
import { PageHeader } from '../../components/shared/PageHeader'
import { DataTable, type Column } from '../../components/shared/DataTable'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { type Referral } from '../../data/referrals'
import { providers } from '../../data/providers'

export function ReferralListPage() {
  const navigate = useNavigate()
  const { data: referrals, isLoading } = useReferrals()
  const { data: patients } = usePatients()

  if (isLoading) return <PageLoader />

  const getPatientName = (id: string) => {
    const p = (patients ?? []).find((x) => x.id === id)
    return p ? `${p.firstName} ${p.lastName}` : id
  }
  const getProviderName = (id: string) => providers.find((p) => p.id === id)?.name ?? id

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{getPatientName((r as unknown as Referral).patientId)}</span> },
    { key: 'specialty', header: 'Specialty', sortable: true },
    { key: 'referring', header: 'Referring', render: (r) => <span className="text-sm">{getProviderName((r as unknown as Referral).referringProvider)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={(r as unknown as Referral).status} /> },
    { key: 'urgency', header: 'Urgency', render: (r) => <StatusBadge status={(r as unknown as Referral).urgency} /> },
    { key: 'sentDate', header: 'Sent Date', sortable: true, render: (r) => format(parseISO((r as unknown as Referral).sentDate), 'MMM d, yyyy') },
    { key: 'expectedDate', header: 'Expected', sortable: true, render: (r) => format(parseISO((r as unknown as Referral).expectedDate), 'MMM d, yyyy') },
  ]

  return (
    <div>
      <PageHeader
        title="Referrals"
        description={`${(referrals ?? []).length} referrals`}
        actions={
          <button onClick={() => navigate('/referrals/new')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Referral
          </button>
        }
      />
      <DataTable
        columns={columns}
        data={(referrals ?? []).map((r) => ({ ...r } as unknown as Record<string, unknown>))}
        searchable
        searchPlaceholder="Search referrals..."
      />
    </div>
  )
}
