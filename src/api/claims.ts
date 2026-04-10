import { claims as claimsData, type Claim } from '../data/claims'
import { callOpenFn } from './openFnClient'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
let claimsStore = [...claimsData]

export async function fetchClaims(): Promise<Claim[]> {
  await delay(300)
  return [...claimsStore]
}

export async function createClaim(data: Omit<Claim, 'id'>): Promise<Claim> {
  const newId = `CLM-${String(claimsStore.length + 1).padStart(3, '0')}`
  const claim: Claim = { id: newId, ...data }
  const workflowName = data.type === 'prior_auth' ? 'prior-auth-submit' : 'claim-submission'
  const result = await callOpenFn(workflowName, { claim }, claim)
  claimsStore = [...claimsStore, result]
  return result
}

export async function updateClaim(id: string, data: Partial<Claim>): Promise<Claim> {
  const existing = claimsStore.find((c) => c.id === id)
  if (!existing) throw new Error(`Claim ${id} not found`)
  const updated = { ...existing, ...data }
  const result = await callOpenFn('claim-update', { id, data }, updated)
  claimsStore = claimsStore.map((c) => (c.id === id ? result : c))
  return result
}
