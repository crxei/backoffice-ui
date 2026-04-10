import { carePlans as cpData, type CarePlan } from '../data/carePlans'
import { callOpenFn } from './openFnClient'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
let cpStore = [...cpData]

export async function fetchCarePlans(): Promise<CarePlan[]> {
  await delay(300)
  return [...cpStore]
}

export async function fetchCarePlanById(id: string): Promise<CarePlan | undefined> {
  await delay(300)
  return cpStore.find((c) => c.id === id)
}

export async function createCarePlan(data: Omit<CarePlan, 'id'>): Promise<CarePlan> {
  const newId = `CP-${String(cpStore.length + 1).padStart(3, '0')}`
  const cp: CarePlan = { id: newId, ...data }
  const result = await callOpenFn('care-plan-create', { carePlan: cp }, cp)
  cpStore = [...cpStore, result]
  return result
}

export async function updateCarePlan(id: string, data: Partial<CarePlan>): Promise<CarePlan> {
  const existing = cpStore.find((c) => c.id === id)
  if (!existing) throw new Error(`Care plan ${id} not found`)
  const updated = { ...existing, ...data }
  const result = await callOpenFn('care-plan-sync', { id, data }, updated)
  cpStore = cpStore.map((c) => (c.id === id ? result : c))
  return result
}
