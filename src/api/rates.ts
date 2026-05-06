import { type ProviderRate, type RateEntityType } from '../data/rates'
import { middlewareGet, middlewarePost, middlewarePatch, middlewareDelete } from './middlewareClient'

export interface RatesFilter {
  type?: RateEntityType
  serviceCode?: string
  active?: boolean
}

interface ApiRate {
  id?: string
  name: string
  serviceCode: string
  type: string
  rate: string
  active: boolean
}

interface ApiRatesPage {
  page: number
  total: number
  pageSize: number
  rates: ApiRate[]
}

function mapApiRate(r: ApiRate, index: number): ProviderRate {
  return {
    id: r.id ?? `RATE-${index}`,
    name: r.name,
    serviceCode: r.serviceCode,
    type: r.type as RateEntityType,
    rate: parseFloat(r.rate),
    active: r.active,
  }
}

async function fetchAllRates(): Promise<ApiRate[]> {
  const first = await middlewareGet<ApiRatesPage>('/api/rates?page=1')
  const allRates = [...first.rates]
  const totalPages = Math.ceil(first.total / first.pageSize)
  for (let page = 2; page <= totalPages; page++) {
    const next = await middlewareGet<ApiRatesPage>(`/api/rates?page=${page}`)
    allRates.push(...next.rates)
  }
  return allRates
}

export async function fetchRates(filters?: RatesFilter): Promise<ProviderRate[]> {
  const data = await fetchAllRates()
  let result = data.map(mapApiRate)
  if (filters?.type) result = result.filter((r) => r.type === filters.type)
  if (filters?.serviceCode) result = result.filter((r) => r.serviceCode === filters.serviceCode)
  if (filters?.active !== undefined) result = result.filter((r) => r.active === filters.active)
  return result
}

export async function fetchRate(rateId: string): Promise<ProviderRate> {
  const data = await middlewareGet<ApiRate>(`/api/rates/${rateId}`)
  return mapApiRate(data, 0)
}

export async function createRate(data: Omit<ProviderRate, 'id'>): Promise<ProviderRate> {
  const body = { ...data, rate: String(data.rate) }
  const created = await middlewarePost<ApiRate>('/api/rates', body)
  return mapApiRate(created, 0)
}

export async function updateRate(rateId: string, data: Partial<Omit<ProviderRate, 'id'>>): Promise<ProviderRate> {
  const body = data.rate != null ? { ...data, rate: String(data.rate) } : data
  const updated = await middlewarePatch<ApiRate>(`/api/rates/${rateId}`, body)
  return mapApiRate(updated, 0)
}

export async function deleteRate(rateId: string): Promise<void> {
  await middlewareDelete(`/api/rates/${rateId}`)
}
