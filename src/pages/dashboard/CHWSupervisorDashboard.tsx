import { format, parseISO } from 'date-fns'
import { MapPin, AlertTriangle, CheckSquare, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEncounters } from '../../hooks/useEncounters'
import { usePatients } from '../../hooks/usePatients'
import { useEscalateEncounter } from '../../hooks/useEncounters'
import { StatCard } from '../../components/shared/StatCard'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { toast } from '../../components/shared/Toast'

export function CHWSupervisorDashboard() {
  const navigate = useNavigate()
  const { data: encounters, isLoading } = useEncounters()
  const { data: patients } = usePatients()
  const escalateMutation = useEscalateEncounter()

  if (isLoading) return <PageLoader />

  const today = new Date().toDateString()
  const activeNow = (encounters ?? []).filter((e) => e.status === 'in_progress')
  const overdueCheckouts = (encounters ?? []).filter(
    (e) => e.status === 'in_progress' && e.checkInTime && !e.checkOutTime
  )
  const completedToday = (encounters ?? []).filter(
    (e) => e.status === 'completed' && new Date(e.scheduledDate).toDateString() === today
  )
  const openEscalations = (encounters ?? []).filter((e) => e.status === 'escalated')
  const missedVisits = (encounters ?? []).filter((e) => e.status === 'missed')

  const getPatientName = (patientId: string) => {
    const p = (patients ?? []).find((x) => x.id === patientId)
    return p ? `${p.firstName} ${p.lastName}` : patientId
  }

  const handleEscalate = async (encId: string) => {
    try {
      await escalateMutation.mutateAsync(encId)
      toast('success', 'Escalation created', 'Supervisor has been notified')
    } catch {
      toast('error', 'Escalation failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Visits Now" value={activeNow.length} icon={MapPin} color="teal" />
        <StatCard label="Overdue Check-outs" value={overdueCheckouts.length} icon={Clock} color={overdueCheckouts.length > 0 ? 'red' : 'blue'} />
        <StatCard label="Completions Today" value={completedToday.length} icon={CheckSquare} color="green" />
        <StatCard label="Open Escalations" value={openEscalations.length} icon={AlertTriangle} color={openEscalations.length > 0 ? 'orange' : 'blue'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active & In-Progress Visits */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Active CHW Visits</h3>
          {[...activeNow, ...missedVisits].length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No active visits</p>
          ) : (
            <div className="space-y-3">
              {[...activeNow, ...missedVisits].map((enc) => (
                <div key={enc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{getPatientName(enc.patientId)}</p>
                    <p className="text-xs text-gray-500">
                      {enc.chwName} · Check-in: {enc.checkInTime ?? 'Not checked in'}
                    </p>
                    {enc.flags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {enc.flags.map((flag) => (
                          <span key={flag} className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">{flag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={enc.status} />
                    {(enc.status === 'missed' || enc.status === 'in_progress') && (enc as { status: string }).status !== 'escalated' && (
                      <button
                        onClick={() => handleEscalate(enc.id)}
                        className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Escalate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Escalation Queue */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Escalation Queue</h3>
          {openEscalations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No active escalations</p>
          ) : (
            <div className="space-y-3">
              {openEscalations.map((enc) => (
                <div key={enc.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{getPatientName(enc.patientId)}</p>
                      <p className="text-xs text-gray-600">CHW: {enc.chwName}</p>
                      <p className="text-xs text-gray-600">{format(parseISO(enc.scheduledDate), 'MMM d, yyyy')}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/chw-visits/${enc.id}`)}
                      className="text-xs text-red-600 border border-red-300 px-2 py-1 rounded hover:bg-red-50"
                    >
                      View
                    </button>
                  </div>
                  {enc.flags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {enc.flags.map((flag) => (
                        <span key={flag} className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">{flag}</span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-600">{enc.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
