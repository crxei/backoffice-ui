export interface CarePlanGoal {
  id: string
  description: string
  status: 'not_started' | 'in_progress' | 'achieved' | 'overdue'
  targetDate: string
}

export interface CarePlanTask {
  id: string
  description: string
  assignee: string
  status: 'pending' | 'completed'
  dueDate: string
}

export interface CarePlan {
  id: string
  patientId: string
  title: string
  status: 'draft' | 'pending_approval' | 'active' | 'completed' | 'archived'
  createdBy: string
  assignedClinician: string
  createdDate: string
  targetDate: string
  goals: CarePlanGoal[]
  tasks: CarePlanTask[]
  notes: string
}

export interface CarePlanListItem {
  id: string
  title: string
  status: 'draft' | 'pending_approval' | 'active' | 'completed' | 'archived'
  patient: { id: string; name: string; mrn: string }
  clinician: { id?: string; name: string }
  createdDate: string
  targetDate?: string
  lastUpdated: string
  goalsProgress: { total: number; achieved: number; inProgress: number; overdue: number }
}

export type CarePlanStatus = 'draft' | 'pending_approval' | 'active' | 'completed' | 'archived'

export interface CarePlanDetailGoal {
  id: string
  description: string
  achievementStatus: string   // FHIR: "improving" | "achieved" | "worsening" | etc.
  dueDate: string
  baselineValue?: number
  targetValue?: number
  targetComparator?: string
  targetUnit?: string
}

export interface CarePlanDetailActivity {
  id: string
  display: string
  category: string
  assignedTeamType: string
  authoredOn?: string
  cptCode?: string
  loincCode?: string
  frequency?: { period: number; periodUnit: string }
  status: string
}

export interface CarePlanDetail {
  id: string
  title: string
  status: CarePlanStatus
  intent?: string
  consentObtained?: boolean
  period?: { start: string; end?: string }
  author: { id?: string; name: string }
  goals: CarePlanDetailGoal[]
  activities: CarePlanDetailActivity[]
  addressedConditions: Array<{ reference: string }>
}

export const carePlans: CarePlan[] = [
  {
    id: 'CP-001',
    patientId: 'P-001',
    title: 'Diabetes & CKD Management Plan',
    status: 'active',
    createdBy: 'U-001',
    assignedClinician: 'PRV-001',
    createdDate: '2024-01-15',
    targetDate: '2024-07-15',
    goals: [
      { id: 'G-001', description: 'Reduce A1C to below 7.5%', status: 'in_progress', targetDate: '2024-06-01' },
      { id: 'G-002', description: 'Maintain blood pressure below 130/80', status: 'achieved', targetDate: '2024-04-01' },
      { id: 'G-003', description: 'Attend monthly nephrology check-ins', status: 'in_progress', targetDate: '2024-07-15' },
    ],
    tasks: [
      { id: 'T-001', description: 'Schedule quarterly A1C lab draw', assignee: 'Sarah Chen', status: 'completed', dueDate: '2024-02-01' },
      { id: 'T-002', description: 'Enroll in diabetes education program', assignee: 'Sarah Chen', status: 'completed', dueDate: '2024-02-15' },
      { id: 'T-003', description: 'Arrange nephrology referral', assignee: 'Sarah Chen', status: 'pending', dueDate: '2024-03-01' },
    ],
    notes: 'Patient highly motivated. Family support strong.',
  },
  {
    id: 'CP-002',
    patientId: 'P-007',
    title: 'Heart Failure Multi-Morbidity Care Plan',
    status: 'pending_approval',
    createdBy: 'U-001',
    assignedClinician: 'PRV-008',
    createdDate: '2024-02-20',
    targetDate: '2024-08-20',
    goals: [
      { id: 'G-004', description: 'Reduce hospitalizations to zero in 6 months', status: 'in_progress', targetDate: '2024-08-20' },
      { id: 'G-005', description: 'Daily weight monitoring compliance > 80%', status: 'not_started', targetDate: '2024-04-01' },
      { id: 'G-006', description: 'Medication adherence > 95%', status: 'in_progress', targetDate: '2024-08-20' },
    ],
    tasks: [
      { id: 'T-004', description: 'Set up remote weight monitoring device', assignee: 'Maria Rodriguez', status: 'pending', dueDate: '2024-03-01' },
      { id: 'T-005', description: 'Conduct home safety assessment', assignee: 'Maria Rodriguez', status: 'pending', dueDate: '2024-03-15' },
      { id: 'T-006', description: 'Connect with community nutrition program', assignee: 'Sarah Chen', status: 'pending', dueDate: '2024-03-01' },
    ],
    notes: 'Awaiting Dr. Sharma approval before activating.',
  },
  {
    id: 'CP-003',
    patientId: 'P-016',
    title: 'Heart Failure & CKD Integrated Plan',
    status: 'pending_approval',
    createdBy: 'U-001',
    assignedClinician: 'PRV-002',
    createdDate: '2024-02-28',
    targetDate: '2024-09-01',
    goals: [
      { id: 'G-007', description: 'LVEF improvement target 35–45%', status: 'not_started', targetDate: '2024-09-01' },
      { id: 'G-008', description: 'eGFR stabilization above 40', status: 'not_started', targetDate: '2024-09-01' },
    ],
    tasks: [
      { id: 'T-007', description: 'Schedule cardiac MRI', assignee: 'Sarah Chen', status: 'pending', dueDate: '2024-03-15' },
      { id: 'T-008', description: 'Kidney function labs monthly', assignee: 'Dr. Lisa Patel', status: 'pending', dueDate: '2024-03-01' },
    ],
    notes: 'Complex case — multi-specialist coordination required.',
  },
  {
    id: 'CP-004',
    patientId: 'P-012',
    title: 'COPD & Heart Failure Management',
    status: 'active',
    createdBy: 'U-001',
    assignedClinician: 'PRV-002',
    createdDate: '2023-11-01',
    targetDate: '2024-05-01',
    goals: [
      { id: 'G-009', description: 'No COPD exacerbation requiring ER visit', status: 'in_progress', targetDate: '2024-05-01' },
      { id: 'G-010', description: 'Oxygen saturation > 92% at rest', status: 'achieved', targetDate: '2024-02-01' },
      { id: 'G-011', description: 'Complete 12-week cardiac rehab program', status: 'in_progress', targetDate: '2024-04-01' },
    ],
    tasks: [
      { id: 'T-009', description: 'Enroll in pulmonary rehab', assignee: 'Sarah Chen', status: 'completed', dueDate: '2023-11-15' },
      { id: 'T-010', description: 'Home oxygen therapy setup', assignee: 'Maria Rodriguez', status: 'completed', dueDate: '2023-11-20' },
      { id: 'T-011', description: 'Monthly symptom review call', assignee: 'Maria Rodriguez', status: 'pending', dueDate: '2024-03-01' },
    ],
    notes: 'Patient responding well to tiotropium.',
  },
  {
    id: 'CP-005',
    patientId: 'P-019',
    title: 'COPD & Heart Failure High-Risk Plan',
    status: 'pending_approval',
    createdBy: 'U-001',
    assignedClinician: 'PRV-001',
    createdDate: '2024-03-01',
    targetDate: '2024-09-01',
    goals: [
      { id: 'G-012', description: 'Reduce 30-day readmission risk', status: 'not_started', targetDate: '2024-09-01' },
      { id: 'G-013', description: 'Palliative care integration assessment', status: 'not_started', targetDate: '2024-05-01' },
    ],
    tasks: [
      { id: 'T-012', description: 'Palliative care consultation request', assignee: 'Sarah Chen', status: 'pending', dueDate: '2024-03-15' },
    ],
    notes: 'High-risk patient, age 81. Family meeting planned.',
  },
  {
    id: 'CP-006',
    patientId: 'P-005',
    title: 'CKD Stage 3 & Diabetes Care Plan',
    status: 'active',
    createdBy: 'U-001',
    assignedClinician: 'PRV-005',
    createdDate: '2023-09-01',
    targetDate: '2024-03-01',
    goals: [
      { id: 'G-014', description: 'Preserve kidney function, maintain eGFR above 35', status: 'in_progress', targetDate: '2024-03-01' },
      { id: 'G-015', description: 'Low-protein diet adherence', status: 'in_progress', targetDate: '2024-03-01' },
    ],
    tasks: [
      { id: 'T-013', description: 'Renal dietitian referral', assignee: 'Sarah Chen', status: 'completed', dueDate: '2023-09-15' },
      { id: 'T-014', description: 'Bi-monthly kidney function labs', assignee: 'Dr. Kevin Nakamura', status: 'pending', dueDate: '2024-03-01' },
    ],
    notes: 'Diet compliance improving.',
  },
  {
    id: 'CP-007',
    patientId: 'P-002',
    title: 'Hypertension & Weight Management Plan',
    status: 'active',
    createdBy: 'U-001',
    assignedClinician: 'PRV-001',
    createdDate: '2023-10-01',
    targetDate: '2024-04-01',
    goals: [
      { id: 'G-016', description: 'Achieve BP < 130/80 consistently', status: 'achieved', targetDate: '2024-01-01' },
      { id: 'G-017', description: 'Lose 15 lbs over 6 months', status: 'in_progress', targetDate: '2024-04-01' },
      { id: 'G-018', description: 'Exercise 150 min/week', status: 'in_progress', targetDate: '2024-04-01' },
    ],
    tasks: [
      { id: 'T-015', description: 'Refer to nutrition counseling', assignee: 'Sarah Chen', status: 'completed', dueDate: '2023-10-15' },
      { id: 'T-016', description: 'Gym membership assistance', assignee: 'Maria Rodriguez', status: 'completed', dueDate: '2023-11-01' },
    ],
    notes: 'Great progress — patient very engaged.',
  },
  {
    id: 'CP-008',
    patientId: 'P-009',
    title: 'Depression & Asthma Wellness Plan',
    status: 'active',
    createdBy: 'U-001',
    assignedClinician: 'PRV-006',
    createdDate: '2024-01-10',
    targetDate: '2024-07-10',
    goals: [
      { id: 'G-019', description: 'PHQ-9 score below 10', status: 'in_progress', targetDate: '2024-04-01' },
      { id: 'G-020', description: 'Zero asthma ER visits', status: 'achieved', targetDate: '2024-07-10' },
    ],
    tasks: [
      { id: 'T-017', description: 'Weekly therapy sessions', assignee: 'Dr. Sandra Osei', status: 'pending', dueDate: '2024-03-31' },
      { id: 'T-018', description: 'Rescue inhaler technique training', assignee: 'Maria Rodriguez', status: 'completed', dueDate: '2024-01-20' },
    ],
    notes: 'Patient responding to CBT.',
  },
  {
    id: 'CP-009',
    patientId: 'P-014',
    title: 'Complex Comorbidity Senior Care Plan',
    status: 'active',
    createdBy: 'U-001',
    assignedClinician: 'PRV-008',
    createdDate: '2023-08-01',
    targetDate: '2024-08-01',
    goals: [
      { id: 'G-021', description: 'Maintain independence in ADLs', status: 'in_progress', targetDate: '2024-08-01' },
      { id: 'G-022', description: 'Zero falls in 6-month period', status: 'in_progress', targetDate: '2024-08-01' },
      { id: 'G-023', description: 'Social engagement 3x/week', status: 'not_started', targetDate: '2024-05-01' },
    ],
    tasks: [
      { id: 'T-019', description: 'Home safety modification assessment', assignee: 'Maria Rodriguez', status: 'completed', dueDate: '2023-08-15' },
      { id: 'T-020', description: 'Senior center enrollment', assignee: 'Maria Rodriguez', status: 'pending', dueDate: '2024-04-01' },
    ],
    notes: 'Family very involved. Daughter attends appointments.',
  },
  {
    id: 'CP-010',
    patientId: 'P-003',
    title: 'Heart Failure & COPD Palliative Plan',
    status: 'draft',
    createdBy: 'U-001',
    assignedClinician: 'PRV-001',
    createdDate: '2024-03-05',
    targetDate: '2024-09-05',
    goals: [
      { id: 'G-024', description: 'Symptom management and comfort', status: 'not_started', targetDate: '2024-09-05' },
    ],
    tasks: [
      { id: 'T-021', description: 'Palliative care team introduction', assignee: 'Sarah Chen', status: 'pending', dueDate: '2024-04-01' },
    ],
    notes: 'Draft pending family discussion.',
  },
  {
    id: 'CP-011',
    patientId: 'P-017',
    title: 'Type 2 Diabetes Optimization Plan',
    status: 'active',
    createdBy: 'U-001',
    assignedClinician: 'PRV-003',
    createdDate: '2023-12-01',
    targetDate: '2024-06-01',
    goals: [
      { id: 'G-025', description: 'A1C below 7.0%', status: 'in_progress', targetDate: '2024-06-01' },
      { id: 'G-026', description: 'Continuous glucose monitoring compliance', status: 'in_progress', targetDate: '2024-06-01' },
    ],
    tasks: [
      { id: 'T-022', description: 'CGM device setup and training', assignee: 'Dr. Marcus Webb', status: 'completed', dueDate: '2023-12-15' },
      { id: 'T-023', description: 'Monthly endocrinology visits', assignee: 'Dr. Marcus Webb', status: 'pending', dueDate: '2024-04-01' },
    ],
    notes: 'Patient using insulin pump, good tech literacy.',
  },
  {
    id: 'CP-012',
    patientId: 'P-011',
    title: 'CKD Progression Prevention Plan',
    status: 'active',
    createdBy: 'U-001',
    assignedClinician: 'PRV-005',
    createdDate: '2023-10-15',
    targetDate: '2024-10-15',
    goals: [
      { id: 'G-027', description: 'Prevent progression to CKD Stage 4', status: 'in_progress', targetDate: '2024-10-15' },
      { id: 'G-028', description: 'Protein intake below 0.8g/kg/day', status: 'in_progress', targetDate: '2024-10-15' },
    ],
    tasks: [
      { id: 'T-024', description: 'Renal diet education session', assignee: 'Maria Rodriguez', status: 'completed', dueDate: '2023-11-01' },
      { id: 'T-025', description: 'Quarterly eGFR monitoring', assignee: 'Dr. Kevin Nakamura', status: 'pending', dueDate: '2024-04-15' },
    ],
    notes: 'Stable for now. Continue monitoring.',
  },
  {
    id: 'CP-013',
    patientId: 'P-004',
    title: 'Asthma Action & Hypertension Plan',
    status: 'completed',
    createdBy: 'U-001',
    assignedClinician: 'PRV-004',
    createdDate: '2023-06-01',
    targetDate: '2023-12-01',
    goals: [
      { id: 'G-029', description: 'Asthma well-controlled per GINA criteria', status: 'achieved', targetDate: '2023-12-01' },
      { id: 'G-030', description: 'BP consistently below 140/90', status: 'achieved', targetDate: '2023-12-01' },
    ],
    tasks: [
      { id: 'T-026', description: 'Asthma education class', assignee: 'Maria Rodriguez', status: 'completed', dueDate: '2023-06-15' },
    ],
    notes: 'Goals achieved. Plan closed successfully.',
  },
  {
    id: 'CP-014',
    patientId: 'P-020',
    title: 'COPD & Asthma Respiratory Plan',
    status: 'active',
    createdBy: 'U-001',
    assignedClinician: 'PRV-004',
    createdDate: '2024-01-05',
    targetDate: '2024-07-05',
    goals: [
      { id: 'G-031', description: 'FEV1 improvement > 10%', status: 'not_started', targetDate: '2024-07-05' },
      { id: 'G-032', description: 'Smoking cessation program completion', status: 'overdue', targetDate: '2024-02-28' },
    ],
    tasks: [
      { id: 'T-027', description: 'Smoking cessation referral', assignee: 'Sarah Chen', status: 'completed', dueDate: '2024-01-15' },
      { id: 'T-028', description: 'Pulmonary rehab enrollment', assignee: 'Dr. Angela Torres', status: 'pending', dueDate: '2024-04-01' },
    ],
    notes: 'Patient struggling with smoking cessation.',
  },
  {
    id: 'CP-015',
    patientId: 'P-010',
    title: 'Diabetes & Hypertension Management',
    status: 'archived',
    createdBy: 'U-001',
    assignedClinician: 'PRV-001',
    createdDate: '2023-01-01',
    targetDate: '2023-07-01',
    goals: [
      { id: 'G-033', description: 'A1C below 8.0%', status: 'achieved', targetDate: '2023-07-01' },
      { id: 'G-034', description: 'Weight reduction 10 lbs', status: 'achieved', targetDate: '2023-07-01' },
    ],
    tasks: [
      { id: 'T-029', description: 'Nutritionist referral', assignee: 'Sarah Chen', status: 'completed', dueDate: '2023-01-15' },
    ],
    notes: 'Archived after plan completion. New plan created.',
  },
]
