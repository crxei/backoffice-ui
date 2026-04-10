import { patients as patientsData, type Patient } from '../data/patients'
import { callOpenFn } from './openFnClient'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

let patientsStore = [...patientsData]

export async function fetchPatients(): Promise<Patient[]> {
  await delay(300)
  return [...patientsStore]
}

export async function fetchPatientById(id: string): Promise<Patient | undefined> {
  await delay(300)
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
