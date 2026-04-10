import { consents as consentsData, type Consent } from '../data/consents'
import { callOpenFn } from './openFnClient'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
let consentsStore = [...consentsData]

export async function fetchConsents(): Promise<Consent[]> {
  await delay(300)
  return [...consentsStore]
}

export async function createConsent(data: Omit<Consent, 'id'>): Promise<Consent> {
  const newId = `CON-${String(consentsStore.length + 1).padStart(3, '0')}`
  const consent: Consent = { id: newId, ...data }
  const result = await callOpenFn('consent-record', { consent }, consent)
  consentsStore = [...consentsStore, result]
  return result
}

export async function updateConsent(id: string, data: Partial<Consent>): Promise<Consent> {
  const existing = consentsStore.find((c) => c.id === id)
  if (!existing) throw new Error(`Consent ${id} not found`)
  const updated = { ...existing, ...data }
  const result = await callOpenFn('consent-update', { id, data }, updated)
  consentsStore = consentsStore.map((c) => (c.id === id ? result : c))
  return result
}
