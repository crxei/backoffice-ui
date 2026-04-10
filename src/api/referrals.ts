import { referrals as refData, type Referral } from '../data/referrals'
import { callOpenFn } from './openFnClient'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
let refStore = [...refData]

export async function fetchReferrals(): Promise<Referral[]> {
  await delay(300)
  return [...refStore]
}

export async function createReferral(data: Omit<Referral, 'id'>): Promise<Referral> {
  const newId = `REF-${String(refStore.length + 1).padStart(3, '0')}`
  const referral: Referral = { id: newId, ...data }
  const result = await callOpenFn('referral-create', { referral }, referral)
  refStore = [...refStore, result]
  return result
}

export async function updateReferral(id: string, data: Partial<Referral>): Promise<Referral> {
  const existing = refStore.find((r) => r.id === id)
  if (!existing) throw new Error(`Referral ${id} not found`)
  const updated = { ...existing, ...data }
  const result = await callOpenFn('referral-update', { id, data }, updated)
  refStore = refStore.map((r) => (r.id === id ? result : r))
  return result
}
