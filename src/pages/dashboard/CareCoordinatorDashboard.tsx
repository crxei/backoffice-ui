import { format, parseISO, differenceInHours } from 'date-fns'
import { Calendar, Bell, ClipboardList, FileCheck, RefreshCw, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppointments } from '../../hooks/useAppointments'
import { useNotifications } from '../../hooks/useNotifications'
import { useCarePlans } from '../../hooks/useCarePlans'
import { useReferrals } from '../../hooks/useReferrals'
import { usePatients } from '../../hooks/usePatients'
import { StatCard } from '../../components/shared/StatCard'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { toast } from '../../components/shared/Toast'
import { useRetryNotification } from '../../hooks/useNotifications'

export function CareCoordinatorDashboard() {
  const navigate = useNavigate()
  const { data: appointments, isLoading: aptsLoading } = useAppointments()
  const { data: notifications } = useNotifications()
  const { data: carePlans } = useCarePlans()
  const { data: referrals } = useReferrals()
  const { data: patients } = usePatients()
  const retryMutation = useRetryNotification()

  if (aptsLoading) return <PageLoader />

  const today = new Date().toDateString()
  const todayApts = (appointments ?? []).filter(
    (a) => new Date(a.dateTime).toDateString() === today
  )
  const pendingReminders = (notifications ?? []).filter(
    (n) => n.status === 'pending' || n.status === 'failed'
  )
  const pendingApprovals = (carePlans ?? []).filter((cp) => cp.status === 'pending_approval')
  const consentAlerts = (patients ?? []).filter((p) => p.consentStatus !== 'active')
  const overdueReferrals = (referrals ?? []).filter((r) => r.status === 'overdue')

  const getAgeColor = (createdDate: string) => {
    const hrs = differenceInHours(new Date(), parseISO(createdDate))
    if (hrs < 24) return 'text-green-600'
    if (hrs < 48) return 'text-amber-600'
    return 'text-red-600'
  }

  const getPatientName = (patientId: string) => {
    const p = (patients ?? []).find((x) => x.id === patientId)
    return p ? `${p.firstName} ${p.lastName}` : patientId
  }

  const handleRetry = async (notifId: string) => {
    try {
      await retryMutation.mutateAsync(notifId)
      toast('success', 'Notification queued', 'Retry dispatched successfully')
    } catch {
      toast('error', 'Retry failed', 'Could not resend notification')
    }
  }

  const channelIcon: Record<string, string> = {
    sms: '📱',
    email: '📧',
    push: '🔔',
    teams: '💬',
    voice_call: '📞',
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Appointments"
          value={todayApts.length}
          icon={Calendar}
          variant={todayApts.length === 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Pending Reminders"
          value={pendingReminders.length}
          icon={Bell}
          variant={pendingReminders.length > 5 ? 'warning' : 'default'}
        />
        <StatCard
          label="Open Plan Approvals"
          value={pendingApprovals.length}
          icon={ClipboardList}
          variant={pendingApprovals.length > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Consent Alerts"
          value={consentAlerts.length}
          icon={FileCheck}
          variant={consentAlerts.length > 0 ? 'danger' : 'success'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Today's Appointments</h3>
            <button onClick={() => navigate('/scheduling')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {todayApts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No appointments today</p>
          ) : (
            <div className="space-y-2">
              {todayApts.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{getPatientName(apt.patientId)}</p>
                    <p className="text-xs text-gray-500">
                      {format(parseISO(apt.dateTime), 'h:mm a')} · {apt.type.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={apt.status} />
                    <button
                      onClick={() => navigate(`/scheduling/${apt.id}`)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reminder Queue */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Reminder Queue</h3>
            <button onClick={() => navigate('/reminders')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {pendingReminders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No pending reminders</p>
          ) : (
            <div className="space-y-2">
              {pendingReminders.slice(0, 5).map((n) => (
                <div key={n.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{channelIcon[n.channel]}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{getPatientName(n.patientId)}</p>
                      <p className="text-xs text-gray-500">{n.type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={n.status} />
                    {n.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(n.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Retry"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Care Plan Approvals */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Care Plan Approvals</h3>
            <button onClick={() => navigate('/care-plans')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {pendingApprovals.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No pending approvals</p>
          ) : (
            <div className="space-y-2">
              {pendingApprovals.map((cp) => (
                <div key={cp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{cp.title}</p>
                    <p className="text-xs text-gray-500">{getPatientName(cp.patientId)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${getAgeColor(cp.createdDate)}`}>
                      {differenceInHours(new Date(), parseISO(cp.createdDate))}h ago
                    </span>
                    <button
                      onClick={() => navigate(`/care-plans/${cp.id}`)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Referrals */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Referral Follow-ups Due</h3>
            <button onClick={() => navigate('/referrals')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {overdueReferrals.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No overdue referrals</p>
          ) : (
            <div className="space-y-2">
              {overdueReferrals.map((ref) => (
                <div key={ref.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{getPatientName(ref.patientId)}</p>
                    <p className="text-xs text-gray-500">{ref.specialty} · Expected {format(parseISO(ref.expectedDate), 'MMM d')}</p>
                  </div>
                  <StatusBadge status="overdue" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
