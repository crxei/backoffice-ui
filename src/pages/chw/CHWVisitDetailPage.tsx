import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { useEncounter, useEscalateEncounter } from '../../hooks/useEncounters'
import { usePatients } from '../../hooks/usePatients'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { toast } from '../../components/shared/Toast'

export function CHWVisitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: enc, isLoading } = useEncounter(id ?? '')
  const { data: patients } = usePatients()
  const escalateMutation = useEscalateEncounter()

  if (isLoading) return <PageLoader />
  if (!enc) return <div className="text-center py-20 text-gray-500">Encounter not found</div>

  const patient = (patients ?? []).find((p) => p.id === enc.patientId)

  const handleEscalate = async () => {
    try {
      await escalateMutation.mutateAsync(enc.id)
      toast('success', 'Escalation Created')
    } catch { toast('error', 'Escalation Failed') }
  }

  return (
    <div>
      <button onClick={() => navigate('/chw-visits')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to CHW Visits
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{enc.id}</h1>
            <p className="text-sm text-gray-500 capitalize">{enc.visitType.replace('_', ' ')}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={enc.status} />
            {(enc.status === 'missed' || enc.status === 'in_progress') && (
              <button onClick={handleEscalate} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                <AlertTriangle className="h-3.5 w-3.5" /> Escalate
              </button>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500 text-xs mb-0.5">Patient</dt><dd className="font-medium">{patient ? `${patient.firstName} ${patient.lastName}` : enc.patientId}</dd></div>
          <div><dt className="text-gray-500 text-xs mb-0.5">CHW</dt><dd>{enc.chwName}</dd></div>
          <div><dt className="text-gray-500 text-xs mb-0.5">Scheduled Date</dt><dd>{format(parseISO(enc.scheduledDate), 'MMM d, yyyy')}</dd></div>
          <div><dt className="text-gray-500 text-xs mb-0.5">Visit Type</dt><dd className="capitalize">{enc.visitType.replace(/_/g, ' ')}</dd></div>
          <div><dt className="text-gray-500 text-xs mb-0.5">Check-In</dt><dd>{enc.checkInTime ?? 'Not checked in'}</dd></div>
          <div><dt className="text-gray-500 text-xs mb-0.5">Check-Out</dt><dd>{enc.checkOutTime ?? 'Not checked out'}</dd></div>
          <div className="col-span-2"><dt className="text-gray-500 text-xs mb-0.5">Address</dt><dd>{enc.address}</dd></div>
          {enc.notes && <div className="col-span-2"><dt className="text-gray-500 text-xs mb-0.5">Notes</dt><dd className="text-gray-700 bg-gray-50 p-3 rounded-lg">{enc.notes}</dd></div>}
        </dl>

        {enc.flags.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Flags</p>
            <div className="flex flex-wrap gap-2">
              {enc.flags.map((flag) => (
                <span key={flag} className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">{flag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
