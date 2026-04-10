import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { useAppointment } from '../../hooks/useAppointments'
import { usePatients } from '../../hooks/usePatients'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { providers } from '../../data/providers'

export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: apt, isLoading } = useAppointment(id ?? '')
  const { data: patients } = usePatients()

  if (isLoading) return <PageLoader />
  if (!apt) return <div className="text-center py-20 text-gray-500">Appointment not found</div>

  const patient = (patients ?? []).find((p) => p.id === apt.patientId)
  const provider = providers.find((p) => p.id === apt.providerId)

  return (
    <div>
      <button onClick={() => navigate('/scheduling')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Schedule
      </button>
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{apt.id}</h1>
            <p className="text-sm text-gray-500 capitalize">{apt.type.replace('_', ' ')}</p>
          </div>
          <StatusBadge status={apt.status} />
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500 text-xs mb-0.5">Patient</dt><dd className="font-medium">{patient ? `${patient.firstName} ${patient.lastName}` : apt.patientId}</dd></div>
          <div><dt className="text-gray-500 text-xs mb-0.5">Provider</dt><dd className="font-medium">{provider?.name ?? apt.providerId}</dd></div>
          <div><dt className="text-gray-500 text-xs mb-0.5">Date & Time</dt><dd>{format(parseISO(apt.dateTime), 'MMM d, yyyy h:mm a')}</dd></div>
          <div><dt className="text-gray-500 text-xs mb-0.5">Duration</dt><dd>{apt.duration} minutes</dd></div>
          <div className="col-span-2"><dt className="text-gray-500 text-xs mb-0.5">Location</dt><dd>{apt.location}</dd></div>
          {apt.notes && <div className="col-span-2"><dt className="text-gray-500 text-xs mb-0.5">Notes</dt><dd className="text-gray-700">{apt.notes}</dd></div>}
          <div><dt className="text-gray-500 text-xs mb-0.5">Reminder Sent</dt><dd>{apt.reminderSent ? 'Yes' : 'No'}</dd></div>
          <div><dt className="text-gray-500 text-xs mb-0.5">Eligibility Verified</dt><dd>{apt.eligibilityVerified ? 'Yes' : 'Pending'}</dd></div>
        </dl>
      </div>
    </div>
  )
}
