import { rates as ratesData, type ProviderRate } from '../data/rates'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

let ratesStore = [...ratesData]

export interface RatesFilter {
  serviceProviderId?: string
  active?: boolean
  rateType?: string
  serviceCode?: string
}

export async function fetchRates(filters?: RatesFilter): Promise<ProviderRate[]> {
  await delay(300)
  let result = [...ratesStore]
  if (filters?.serviceProviderId) result = result.filter((r) => r.serviceProviderId === filters.serviceProviderId)
  if (filters?.active !== undefined) result = result.filter((r) => r.active === filters.active)
  if (filters?.rateType) result = result.filter((r) => r.rateType === filters.rateType)
  if (filters?.serviceCode) result = result.filter((r) => r.serviceCode === filters.serviceCode)
  return result
}

export async function fetchRate(rateId: string): Promise<ProviderRate> {
  await delay(200)
  const found = ratesStore.find((r) => r.id === rateId)
  if (!found) throw new Error(`Rate ${rateId} not found`)
  return { ...found }
}

export async function createRate(data: Omit<ProviderRate, 'id'>): Promise<ProviderRate> {
  await delay(400)
  const newId = `RATE-${String(ratesStore.length + 1).padStart(3, '0')}`
  const rate: ProviderRate = { id: newId, ...data }
  ratesStore = [...ratesStore, rate]
  return rate
}

export async function updateRate(rateId: string, data: Partial<Omit<ProviderRate, 'id'>>): Promise<ProviderRate> {
  await delay(400)
  const idx = ratesStore.findIndex((r) => r.id === rateId)
  if (idx === -1) throw new Error(`Rate ${rateId} not found`)
  const updated = { ...ratesStore[idx], ...data }
  ratesStore = ratesStore.map((r) => (r.id === rateId ? updated : r))
  return updated
}

export async function deleteRate(rateId: string): Promise<void> {
  await delay(300)
  ratesStore = ratesStore.filter((r) => r.id !== rateId)
}
