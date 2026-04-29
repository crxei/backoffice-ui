import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, CheckCircle, Clock, AlertCircle, XCircle, Activity, Users } from 'lucide-react'
import { useCarePlanDetail } from '../../hooks/useCarePlans'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'

const teamBadge: Record<string, string> = {
  pac: 'bg-blue-100 text-blue-700',
  chw: 'bg-teal-100 text-teal-700',
  doctor: 'bg-purple-100 text-purple-700',
}

const categoryColor: Record<string, string> = {
  assessment: 'bg-amber-50 text-amber-700 border-amber-200',
  appointment: 'bg-blue-50 text-blue-700 border-blue-200',
  lab: 'bg-green-50 text-green-700 border-green-200',
  screening: 'bg-pink-50 text-pink-700 border-pink-200',
  medication_review: 'bg-purple-50 text-purple-700 border-purple-200',
  wellness_check: 'bg-teal-50 text-teal-700 border-teal-200',
}

function achievementIcon(status: string) {
  switch (status.toLowerCase()) {
    case 'achieved': return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'improving':
    case 'in-progress': return <Clock className="h-4 w-4 text-yellow-500" />
    case 'worsening':
    case 'not-achieved':
    case 'not-attainable': return <AlertCircle className="h-4 w-4 text-red-500" />
    default: return <XCircle className="h-4 w-4 text-gray-400" />
  }
}

function achievementLabel(status: string) {
  const map: Record<string, string> = {
    achieved: 'Achieved',
    improving: 'Improving',
    'in-progress': 'In Progress',
    worsening: 'Worsening',
    'no-change': 'No Change',
    'not-achieved': 'Not Achieved',
    'not-attainable': 'Not Attainable',
    'no-progress': 'No Progress',
  }
  return map[status.toLowerCase()] ?? status
}

function frequencyText(freq: { period: number; periodUnit: string }) {
  const unitMap: Record<string, string> = { d: 'day', wk: 'week', mo: 'month', a: 'year' }
  const unit = unitMap[freq.periodUnit] ?? freq.periodUnit
  return freq.period === 1 ? `Every ${unit}` : `Every ${freq.period} ${unit}s`
}

export function CarePlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: cp, isLoading } = useCarePlanDetail(id ?? '')

  if (isLoading) return <PageLoader />
  if (!cp) return <div className="text-center py-20 text-gray-500">Care plan not found</div>

  return (
    <div>
      <button
        onClick={() => navigate('/care-plans')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Care Plans
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{cp.title}</h1>
              <StatusBadge status={cp.status} />
              {cp.consentObtained && (
                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  <CheckCircle className="h-3 w-3" /> Consent Obtained
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {cp.author.name !== 'Unknown' ? cp.author.name : cp.author.id ?? '—'}
              {cp.intent && <span className="ml-2 text-gray-400 capitalize">· {cp.intent}</span>}
            </p>
            {cp.period?.start && (
              <p className="text-xs text-gray-400 mt-1">
                Started {format(parseISO(cp.period.start), 'MMM d, yyyy')}
                {cp.period.end ? ` · Ends ${format(parseISO(cp.period.end), 'MMM d, yyyy')}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Goals ({cp.goals.length})</h3>
          {cp.goals.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No goals defined</p>
          ) : (
            <div className="space-y-3">
              {cp.goals.map((goal) => (
                <div key={goal.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{achievementIcon(goal.achievementStatus)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{goal.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                          {achievementLabel(goal.achievementStatus)}
                        </span>
                        {goal.dueDate && (
                          <span className="text-xs text-gray-500">
                            Due {format(parseISO(goal.dueDate), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                      {(goal.baselineValue != null || goal.targetValue != null) && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          {goal.baselineValue != null && (
                            <span className="text-gray-500">
                              Baseline: <span className="font-medium text-gray-700">{goal.baselineValue}{goal.targetUnit}</span>
                            </span>
                          )}
                          {goal.targetValue != null && (
                            <span className="text-gray-500">
                              → Target: <span className="font-medium text-blue-700">{goal.targetComparator}{goal.targetValue}{goal.targetUnit}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activities */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-500" />
              Activities ({cp.activities.length})
            </span>
          </h3>
          {cp.activities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No activities defined</p>
          ) : (
            <div className="space-y-3">
              {cp.activities.map((act) => (
                <div key={act.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-medium text-gray-900">{act.display}</p>
                    <StatusBadge status={act.status} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${categoryColor[act.category] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {act.category.replace(/_/g, ' ')}
                    </span>
                    {act.assignedTeamType && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${teamBadge[act.assignedTeamType] ?? 'bg-gray-100 text-gray-600'}`}>
                        <Users className="h-3 w-3 inline mr-0.5" />
                        {act.assignedTeamType.toUpperCase()}
                      </span>
                    )}
                    {act.frequency && (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {frequencyText(act.frequency)}
                      </span>
                    )}
                  </div>
                  {(act.cptCode || act.loincCode) && (
                    <div className="flex gap-3 text-xs text-gray-400 font-mono">
                      {act.cptCode && <span>CPT: {act.cptCode}</span>}
                      {act.loincCode && <span>LOINC: {act.loincCode}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Addressed Conditions */}
      {cp.addressedConditions.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Addressed Conditions</h3>
          <div className="flex flex-wrap gap-2">
            {cp.addressedConditions.map((c) => (
              <span key={c.reference} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-mono">
                {c.reference.replace('Condition/', '')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
