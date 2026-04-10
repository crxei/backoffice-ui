import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { PatientListPage } from './pages/patients/PatientListPage'
import { PatientDetailPage } from './pages/patients/PatientDetailPage'
import { PatientRegistrationPage } from './pages/patients/PatientRegistrationPage'
import { SchedulingPage } from './pages/scheduling/SchedulingPage'
import { NewAppointmentPage } from './pages/scheduling/NewAppointmentPage'
import { AppointmentDetailPage } from './pages/scheduling/AppointmentDetailPage'
import { CarePlanListPage } from './pages/carePlans/CarePlanListPage'
import { CarePlanDetailPage } from './pages/carePlans/CarePlanDetailPage'
import { NewCarePlanPage } from './pages/carePlans/NewCarePlanPage'
import { ClinicalDataPage } from './pages/clinical/ClinicalDataPage'
import { CHWVisitsPage } from './pages/chw/CHWVisitsPage'
import { CHWVisitDetailPage } from './pages/chw/CHWVisitDetailPage'
import { ReferralListPage } from './pages/referrals/ReferralListPage'
import { NewReferralPage } from './pages/referrals/NewReferralPage'
import { EligibilityPage } from './pages/insurance/EligibilityPage'
import { PriorAuthPage } from './pages/priorAuth/PriorAuthPage'
import { NewPriorAuthPage } from './pages/priorAuth/NewPriorAuthPage'
import { ConsentPage } from './pages/consent/ConsentPage'
import { RemindersPage } from './pages/reminders/RemindersPage'
import { ReminderRuleBuilderPage } from './pages/reminders/ReminderRuleBuilderPage'
import { AIVoicePage } from './pages/aiVoice/AIVoicePage'
import { ProviderDirectoryPage } from './pages/providers/ProviderDirectoryPage'
import { ClaimsPage } from './pages/claims/ClaimsPage'
import { ReportsPage } from './pages/reports/ReportsPage'
import { AdminPage } from './pages/admin/AdminPage'
import { OpenFnMonitorPage } from './pages/admin/OpenFnMonitorPage'
import { CareGapsPage } from './pages/careGaps/CareGapsPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'patients', element: <PatientListPage /> },
      { path: 'patients/new', element: <PatientRegistrationPage /> },
      { path: 'patients/:id', element: <PatientDetailPage /> },
      { path: 'scheduling', element: <SchedulingPage /> },
      { path: 'scheduling/new', element: <NewAppointmentPage /> },
      { path: 'scheduling/:id', element: <AppointmentDetailPage /> },
      { path: 'care-plans', element: <CarePlanListPage /> },
      { path: 'care-plans/new', element: <NewCarePlanPage /> },
      { path: 'care-plans/:id', element: <CarePlanDetailPage /> },
      { path: 'clinical', element: <ClinicalDataPage /> },
      { path: 'chw-visits', element: <CHWVisitsPage /> },
      { path: 'chw-visits/:id', element: <CHWVisitDetailPage /> },
      { path: 'referrals', element: <ReferralListPage /> },
      { path: 'referrals/new', element: <NewReferralPage /> },
      { path: 'insurance', element: <EligibilityPage /> },
      { path: 'prior-auth', element: <PriorAuthPage /> },
      { path: 'prior-auth/new', element: <NewPriorAuthPage /> },
      { path: 'consent', element: <ConsentPage /> },
      { path: 'reminders', element: <RemindersPage /> },
      { path: 'reminders/rules', element: <ReminderRuleBuilderPage /> },
      { path: 'ai-voice', element: <AIVoicePage /> },
      { path: 'providers', element: <ProviderDirectoryPage /> },
      { path: 'claims', element: <ClaimsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'care-gaps', element: <CareGapsPage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: 'admin/openfn', element: <OpenFnMonitorPage /> },
    ],
  },
])
