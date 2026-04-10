import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import { useCarePlan, useUpdateCarePlan } from '../../hooks/useCarePlans'
import { usePatients } from '../../hooks/usePatients'
import { useAuthStore } from '../../store/authStore'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { toast } from '../../components/shared/Toast'
import { providers } from '../../data/providers'

const goalIcons = {
  achieved: <CheckCircle className="h-4 w-4 text-green-500" />,
  in_progress: <Clock className="h-4 w-4 text-yellow-500" />,
  overdue: <AlertCircle className="h-4 w-4 text-red-500" />,
  not_started: <XCircle className="h-4 w-4 text-gray-400" />,
}

export function CarePlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: cp, isLoading } = useCarePlan(id ?? '')
  const { data: patients } = usePatients()
  const updateMutation = useUpdateCarePlan()

  if (isLoading) return <PageLoader />
  if (!cp) return <div className="text-center py-20 text-gray-500">Care plan not found</div>

  const patient = (patients ?? []).find((p) => p.id === cp.patientId)
  const clinician = providers.find((p) => p.id === cp.assignedClinician)

  const handleApprove = async () => {
    try {
      await updateMutation.mutateAsync({ id: cp.id, data: { status: 'active' } })
      toast('success', 'Care Plan Approved', 'Plan is now active')
    } catch { toast('error', 'Approval Failed') }
  }

  const handleRevision = async () => {
    try {
      await updateMutation.mutateAsync({ id: cp.id, data: { status: 'draft' } })
      toast('info', 'Revision Requested', 'Plan returned to draft')
    } catch { toast('error', 'Action Failed') }
  }

  const handleSubmit = async () => {
    try {
      await updateMutation.mutateAsync({ id: cp.id, data: { status: 'pending_approval' } })
      toast('success', 'Submitted for Approval', 'Clinician will review soon')
    } catch { toast('error', 'Submission Failed') }
  }

  return (
    <div>
      <button onClick={() => navigate('/care-plans')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Care Plans
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{cp.title}</h1>
              <StatusBadge status={cp.status} />
            </div>
            <p className="text-sm text-gray-500">
              {patient ? `${patient.firstName} ${patient.lastName}` : cp.patientId} · {clinician?.name ?? cp.assignedClinician}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Created {format(parseISO(cp.createdDate), 'MMM d, yyyy')} · Target {format(parseISO(cp.targetDate), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            {cp.status === 'pending_approval' && user?.role === 'clinician' && (
              <>
                <button onClick={handleApprove} disabled={updateMutation.isPending} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-60">
                  {updateMutation.isPending ? <LoadingSpinner size="sm" /> : null} Approve
                </button>
                <button onClick={handleRevision} disabled={updateMutation.isPending} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">
                  Request Revision
                </button>
              </>
            )}
            {cp.status === 'draft' && user?.role === 'care_coordinator' && (
              <button onClick={handleSubmit} disabled={updateMutation.isPending} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {updateMutation.isPending ? <LoadingSpinner size="sm" /> : null} Submit for Approval
              </button>
            )}
          </div>
        </div>
        {cp.notes && <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{cp.notes}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Goals ({cp.goals.length})</h3>
          <div className="space-y-3">
            {cp.goals.map((goal) => (
              <div key={goal.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">{goalIcons[goal.status]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{goal.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={goal.status} />
                    <span className="text-xs text-gray-500">Target: {format(parseISO(goal.targetDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Tasks ({cp.tasks.length})</h3>
          <div className="space-y-3">
            {cp.tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`flex-shrink-0 mt-0.5 h-4 w-4 rounded-full border-2 ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{task.assignee} · Due {format(parseISO(task.dueDate), 'MMM d, yyyy')}</p>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
