import { encounters as encData, type Encounter } from '../data/encounters'
import { callOpenFn } from './openFnClient'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
let encStore = [...encData]

export async function fetchEncounters(): Promise<Encounter[]> {
  await delay(300)
  return [...encStore]
}

export async function fetchEncounterById(id: string): Promise<Encounter | undefined> {
  await delay(300)
  return encStore.find((e) => e.id === id)
}

export async function updateEncounter(id: string, data: Partial<Encounter>): Promise<Encounter> {
  const existing = encStore.find((e) => e.id === id)
  if (!existing) throw new Error(`Encounter ${id} not found`)
  const updated = { ...existing, ...data }
  const result = await callOpenFn('chw-visit-update', { id, data }, updated)
  encStore = encStore.map((e) => (e.id === id ? result : e))
  return result
}

export async function escalateEncounter(id: string): Promise<Encounter> {
  const existing = encStore.find((e) => e.id === id)
  if (!existing) throw new Error(`Encounter ${id} not found`)
  const updated = { ...existing, status: 'escalated' as const }
  const result = await callOpenFn('chw-visit-escalation', { encounterId: id }, updated)
  encStore = encStore.map((e) => (e.id === id ? result : e))
  return result
}
