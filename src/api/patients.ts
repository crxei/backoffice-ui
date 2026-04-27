import { patients as patientsData, type Patient } from '../data/patients'
import { callOpenFn, postToOpenFn } from './openFnClient'

const PATIENTS_LIST_WEBHOOK = 'e640c514-2925-40d3-8968-eb28327ffeac'

interface ApiCondition {
  display: string
  icd10: string
}

interface ApiPatient {
  id: string
  mrn: string
  firstName: string
  lastName: string
  birthDate: string
  gender: 'male' | 'female' | 'other'
  phone: string
  email: string
  active: boolean
  conditions: ApiCondition[]
  primaryProvider: { id: string; display: string }
  riskLevel: 'low' | 'medium' | 'high'
  riskScore: number
  program: string
  journeyStage: string
  lastUpdated: string
}

interface ApiPatientsResponse {
  data: {
    patients: ApiPatient[]
    total: number
    page: number
    pageSize: number
    nextCursor?: string
  }
  meta: { state: string }
}

function mapApiPatient(ap: ApiPatient): Patient {
  return {
    id: ap.id,
    mrn: ap.mrn,
    firstName: ap.firstName,
    lastName: ap.lastName,
    dob: ap.birthDate,
    gender: ap.gender,
    phone: ap.phone ?? '',
    email: ap.email ?? '',
    address: { street: '', city: '', state: '', zip: '' },
    insurance: { payer: '', memberId: '', groupNumber: '', plan: '' },
    primaryProvider: ap.primaryProvider?.display ?? ap.primaryProvider?.id ?? '',
    conditions: (ap.conditions ?? []).map((c) => c.display),
    consentStatus: 'active',
    enrollmentDate: ap.lastUpdated?.slice(0, 10) ?? '',
    riskLevel: ap.riskLevel,
    riskScore: ap.riskScore,
    program: ap.program,
    journeyStage: ap.journeyStage,
  }
}

let patientsStore = [...patientsData]

export async function fetchPatients(): Promise<Patient[]> {
  const response = await postToOpenFn<ApiPatientsResponse>(PATIENTS_LIST_WEBHOOK, {})
  return response.data.patients.map(mapApiPatient)
}

export async function fetchPatientById(id: string): Promise<Patient | undefined> {
  return patientsStore.find((p) => p.id === id)
}

export async function createPatient(data: Omit<Patient, 'id' | 'mrn'>): Promise<Patient> {
  const newId = `P-${String(patientsStore.length + 1).padStart(3, '0')}`
  const newMrn = `MRN-${Math.floor(10000 + Math.random() * 90000)}`
  const patient: Patient = { id: newId, mrn: newMrn, ...data }
  const result = await callOpenFn('patient-registration', { patient }, patient)
  patientsStore = [...patientsStore, result]
  return result
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
  const existing = patientsStore.find((p) => p.id === id)
  if (!existing) throw new Error(`Patient ${id} not found`)
  const updated = { ...existing, ...data }
  const result = await callOpenFn('patient-update', { id, data }, updated)
  patientsStore = patientsStore.map((p) => (p.id === id ? result : p))
  return result
}
