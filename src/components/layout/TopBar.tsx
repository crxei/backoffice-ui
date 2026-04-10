import { useLocation } from 'react-router-dom'
import { Bell, Menu, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { roleLabels } from '../../data/users'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patient Registry',
  '/patients/new': 'Register Patient',
  '/scheduling': 'Scheduling',
  '/scheduling/new': 'New Appointment',
  '/care-plans': 'Care Plans',
  '/care-plans/new': 'New Care Plan',
  '/clinical': 'Clinical Data',
  '/chw-visits': 'CHW Field Visits',
  '/referrals': 'Referrals',
  '/referrals/new': 'New Referral',
  '/insurance': 'Insurance & Eligibility',
  '/prior-auth': 'Prior Authorization',
  '/prior-auth/new': 'New Prior Auth',
  '/consent': 'Consent Management',
  '/reminders': 'Reminders',
  '/reminders/rules': 'Reminder Rules',
  '/ai-voice': 'AI Voice Outreach',
  '/providers': 'Provider Directory',
  '/claims': 'Claims & RCM',
  '/reports': 'Reports',
  '/admin': 'Administration',
  '/admin/openfn': 'OpenFn Monitor',
}

export function TopBar() {
  const { user, logout } = useAuthStore()
  const { notificationCount, toggleSidebar } = useUIStore()
  const location = useLocation()

  const pageTitle = pageTitles[location.pathname] ?? 'CarePortal'

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 z-20 flex-shrink-0">
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1">
        <h2 className="text-base font-semibold text-gray-800">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {user.avatar}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-gray-900 leading-none">{user.name}</p>
              <p className="text-xs text-gray-500 leading-none mt-0.5">{roleLabels[user.role]}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
