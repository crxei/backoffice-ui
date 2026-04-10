import { useAuthStore } from '../../store/authStore'
import { CareCoordinatorDashboard } from './CareCoordinatorDashboard'
import { ClinicalDashboard } from './ClinicalDashboard'
import { CHWSupervisorDashboard } from './CHWSupervisorDashboard'
import { AdminDashboard } from './AdminDashboard'

export function DashboardPage() {
  const { user } = useAuthStore()

  if (!user) return null

  switch (user.role) {
    case 'care_coordinator':
      return <CareCoordinatorDashboard />
    case 'clinician':
      return <ClinicalDashboard />
    case 'chw_supervisor':
      return <CHWSupervisorDashboard />
    case 'admin':
      return <AdminDashboard />
    case 'billing':
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900">Billing Dashboard</h2>
            <p className="mt-2 text-sm text-gray-500">Navigate to Claims & RCM, Insurance & Eligibility, or Prior Authorization from the sidebar.</p>
          </div>
        </div>
      )
    default:
      return null
  }
}
