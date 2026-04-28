export type ContinuumStage =
  | 'intake'
  | 'enrolled'
  | 'assessment'
  | 'active_care'
  | 'maintenance'
  | 'discharged'

export type AssignedTeam = 'pac' | 'chw' | 'doctor'

export interface PatientDetailCondition {
  id: string
  code: string
  display: string
  clinicalStatus: 'active' | 'remission' | 'resolved'
  onsetDate: string | null
}

export interface PatientDetailCarePlanGoal {
  id: string
  description: string
  status: 'not_started' | 'in_progress' | 'achieved' | 'overdue'
  targetDate: string
}

export interface PatientDetailCarePlanTask {
  id: string
  description: string
  assignee: string
  status: 'pending' | 'completed'
  dueDate: string
}

export interface PatientDetailCarePlan {
  id: string
  title: string
  protocol?: string
  status: 'draft' | 'pending_approval' | 'active' | 'completed' | 'archived'
  createdBy?: string
  assignedClinician?: string
  createdDate?: string
  targetDate?: string
  notes?: string
  goals: PatientDetailCarePlanGoal[]
  tasks: PatientDetailCarePlanTask[]
}

export interface PatientDetailAppointment {
  id: string
  providerId?: string
  providerName?: string
  type: string
  status: string
  dateTime: string
  duration?: number
  location?: string
  notes?: string
}

export interface PatientDetailVital {
  date: string
  type: string
  value: string
}

export interface PatientDetailMedication {
  name: string
  frequency: string
  prescribedBy: string
  startDate: string
}

export interface PatientDetailCareTeamMember {
  memberId: string
  memberName?: string
  role: string
  teamType?: AssignedTeam
  isPrimary: boolean
}

export interface PatientDetailCareGap {
  id: string
  protocolId?: string
  protocolName: string
  activityId?: string
  activityName: string
  activityType?: string
  dueDate: string
  lastCompletedDate?: string | null
  status: 'upcoming' | 'overdue' | 'critical' | 'scheduled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTeam: AssignedTeam
  assignedTo?: string | null
  revenueOpportunity?: boolean
  estimatedRevenue?: number
  revenueCode?: string
  notes?: string | null
  createdAt?: string
}

export interface PatientDetailProtocolActivity {
  id: string
  name: string
  type: string
  frequency: string
  assignedTeam: string
  billable: boolean
  revenueCode?: string
  estimatedRevenue?: number
  description: string
}

export interface PatientDetailCareProtocol {
  id: string
  name: string
  color: string
  activities: PatientDetailProtocolActivity[]
}

export interface PatientDetailJourney {
  stage: ContinuumStage
  enrolledDate?: string
  lastContactDate: string
  nextContactDate: string
  primaryTeam: AssignedTeam
  nextActionTeam: AssignedTeam
  nextAction: string
  adherenceScore: number
  activeGapCount: number
  totalActivitiesLast30: number
  completedActivitiesLast30: number
  applicableProtocols: string[]
}

export interface PatientDetailInsurance {
  id: string
  payer: string
  plan: string
  planType?: string
  type?: string
  memberId: string
  groupNumber: string
  status?: string
  effectiveDate?: string
  terminationDate?: string | null
  relationship?: string
}

export interface PatientDetail {
  id: string
  mrn: string
  firstName: string
  lastName: string
  dob: string
  gender: 'male' | 'female' | 'other'
  phone: string
  email: string
  address: { street: string; city: string; state: string; zip: string }
  insurance: PatientDetailInsurance[]
  consentStatus: 'active' | 'expired' | 'missing'
  enrollmentDate: string | null
  riskLevel: 'low' | 'medium' | 'high'
  active: boolean
  lastUpdated: string | null
  primaryProvider: { id: string; name: string; specialty: string; location: string; phone: string } | null
  conditions: PatientDetailCondition[]
  careTeam: PatientDetailCareTeamMember[]
  careGaps: PatientDetailCareGap[]
  journey: PatientDetailJourney | null
  careProtocols: PatientDetailCareProtocol[]
  carePlans: PatientDetailCarePlan[]
  appointments: PatientDetailAppointment[]
  vitals: PatientDetailVital[]
  medications: PatientDetailMedication[]
}
