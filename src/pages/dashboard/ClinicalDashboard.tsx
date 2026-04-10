import { format, parseISO } from 'date-fns'
import { ClipboardList, Zap, Flag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCarePlans } from '../../hooks/useCarePlans'
import { usePatients } from '../../hooks/usePatients'
import { useUpdateCarePlan } from '../../hooks/useCarePlans'
import { StatCard } from '../../components/shared/StatCard'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { toast } from '../../components/shared/Toast'

const cdsAlerts = [
  { id: 'CDS-001', patientId: 'P-001', type: 'Drug Interaction', severity: 'high', message: 'Potential interaction between metformin and lisinopril. Monitor renal function.', acknowledged: false },
  { id: 'CDS-002', patientId: 'P-007', type: 'Overdue Lab', severity: 'medium', message: 'BMP overdue by 14 days for CHF patient. Electrolyte imbalance risk.', acknowledged: false },
  { id: 'CDS-003', patientId: 'P-019', type: 'Readmission Risk', severity: 'high', message: 'Patient flagged for 30-day readmission risk score 78%. Intervention recommended.', acknowledged: false },
  { id: 'CDS-004', patientId: 'P-016', type: 'Guideline Gap', severity: 'low', message: 'ACE inhibitor not prescribed for heart failure patient per ACC/AHA guidelines.', acknowledged: true },
]

export function ClinicalDashboard() {
  const navigate = useNavigate()
  const { data: carePlans, isLoading } = useCarePlans()
  const { data: patients } = usePatients()
  const updateCarePlan = useUpdateCarePlan()

  if (isLoading) return <PageLoader />

  const pendingApprovals = (carePlans ?? []).filter((cp) => cp.status === 'pending_approval')
  const activeCDSAlerts = cdsAlerts.filter((a) => !a.acknowledged)
  const highRiskPatients = (patients ?? []).filter((p) => p.riskLevel === 'high')

  const getPatientName = (patientId: string) => {
    const p = (patients ?? []).find((x) => x.id === patientId)
    return p ? `${p.firstName} ${p.lastName}` : patientId
  }

  const handleApprove = async (cpId: string) => {
    try {
      await updateCarePlan.mutateAsync({ id: cpId, data: { status: 'active' } })
      toast('success', 'Care Plan Approved', 'Plan is now active')
    } catch {
      toast('error', 'Approval Failed', 'Could not approve care plan')
    }
  }

  const handleReject = async (cpId: string) => {
    try {
      await updateCarePlan.mutateAsync({ id: cpId, data: { status: 'draft' } })
      toast('info', 'Revision Requested', 'Plan returned to draft for revision')
    } catch {
      toast('error', 'Action Failed', 'Could not update care plan')
    }
  }

  const severityStyle: Record<string, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Pending Approvals" value={pendingApprovals.length} icon={ClipboardList} variant={pendingApprovals.length > 0 ? 'warning' : 'default'} />
        <StatCard label="Active CDS Alerts" value={activeCDSAlerts.length} icon={Zap} variant={activeCDSAlerts.length > 0 ? 'danger' : 'success'} />
        <StatCard label="High Risk Patients" value={highRiskPatients.length} icon={Flag} variant="warning" />
      </div>

      {/* Care Plans Awaiting Approval */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Care Plans Awaiting My Approval</h3>
        {pendingApprovals.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No care plans pending approval</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="pb-3 pr-4">Patient</th>
                  <th className="pb-3 pr-4">Plan Title</th>
                  <th className="pb-3 pr-4">Created</th>
                  <th className="pb-3 pr-4">Goals</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingApprovals.map((cp) => (
                  <tr key={cp.id}>
                    <td className="py-3 pr-4 text-sm font-medium text-gray-900">{getPatientName(cp.patientId)}</td>
                    <td className="py-3 pr-4 text-sm text-gray-700">{cp.title}</td>
                    <td className="py-3 pr-4 text-sm text-gray-500">{format(parseISO(cp.createdDate), 'MMM d')}</td>
                    <td className="py-3 pr-4 text-sm text-gray-500">{cp.goals.length} goals</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(cp.id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(cp.id)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300"
                        >
                          Request Revision
                        </button>
                        <button
                          onClick={() => navigate(`/care-plans/${cp.id}`)}
                          className="px-3 py-1 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CDS Alerts */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Clinical Decision Support Alerts</h3>
        <div className="space-y-3">
          {cdsAlerts.map((alert) => (
            <div key={alert.id} className={`flex items-start justify-between p-4 rounded-lg border ${alert.acknowledged ? 'opacity-50 bg-gray-50' : 'bg-white border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${severityStyle[alert.severity]}`}>
                  {alert.severity}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{alert.type} — {getPatientName(alert.patientId)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{alert.message}</p>
                </div>
              </div>
              {!alert.acknowledged && (
                <button
                  onClick={() => toast('success', 'Alert acknowledged')}
                  className="flex-shrink-0 text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
                >
                  Acknowledge
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
