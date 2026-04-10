export type UserRole = 'admin' | 'care_coordinator' | 'clinician' | 'chw_supervisor' | 'billing'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string
  department: string
}

export const users: User[] = [
  {
    id: 'U-001',
    name: 'Sarah Chen',
    email: 'sarah.chen@careportal.org',
    role: 'care_coordinator',
    avatar: 'SC',
    department: 'Care Coordination',
  },
  {
    id: 'U-002',
    name: 'Dr. James Okafor',
    email: 'james.okafor@careportal.org',
    role: 'clinician',
    avatar: 'JO',
    department: 'Internal Medicine',
  },
  {
    id: 'U-003',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@careportal.org',
    role: 'chw_supervisor',
    avatar: 'MR',
    department: 'Community Health',
  },
  {
    id: 'U-004',
    name: 'Robert Kim',
    email: 'robert.kim@careportal.org',
    role: 'billing',
    avatar: 'RK',
    department: 'Revenue Cycle',
  },
  {
    id: 'U-005',
    name: 'Alex Thompson',
    email: 'alex.thompson@careportal.org',
    role: 'admin',
    avatar: 'AT',
    department: 'IT Administration',
  },
]

export const roleLabels: Record<UserRole, string> = {
  care_coordinator: 'Care Coordinator',
  clinician: 'Clinician',
  chw_supervisor: 'CHW Supervisor',
  billing: 'Billing',
  admin: 'Admin',
}
