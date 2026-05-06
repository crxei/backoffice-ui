export type RateType = 'PER_UNIT' | 'PER_HOUR' | 'PERCENT_OF_PAID' | 'FLAT'

export interface ProviderRate {
  id: string
  serviceProviderId: string
  serviceProviderName: string
  serviceCode: string
  modifiers: string
  rateType: RateType
  rate: number
  effectiveFrom: string
  effectiveTo: string | null
  active: boolean
}

export const rates: ProviderRate[] = [
  {
    id: 'RATE-001',
    serviceProviderId: '027282707',
    serviceProviderName: 'HAYNES, CHAMIR',
    serviceCode: 'H0036',
    modifiers: '',
    rateType: 'PER_HOUR',
    rate: 50,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    active: true,
  },
  {
    id: 'RATE-002',
    serviceProviderId: '027282707',
    serviceProviderName: 'HAYNES, CHAMIR',
    serviceCode: 'H0036',
    modifiers: 'HQ',
    rateType: 'PER_HOUR',
    rate: 45,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    active: true,
  },
  {
    id: 'RATE-003',
    serviceProviderId: '038491820',
    serviceProviderName: 'TORRES, ELENA',
    serviceCode: 'T1017',
    modifiers: '',
    rateType: 'PER_UNIT',
    rate: 22.5,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    active: true,
  },
  {
    id: 'RATE-004',
    serviceProviderId: '038491820',
    serviceProviderName: 'TORRES, ELENA',
    serviceCode: 'H0036',
    modifiers: '',
    rateType: 'PER_HOUR',
    rate: 50,
    effectiveFrom: '2025-07-01',
    effectiveTo: '2025-12-31',
    active: false,
  },
  {
    id: 'RATE-005',
    serviceProviderId: '049302910',
    serviceProviderName: 'REYES, CARLOS',
    serviceCode: 'H0036',
    modifiers: '',
    rateType: 'PERCENT_OF_PAID',
    rate: 85,
    effectiveFrom: '2026-03-01',
    effectiveTo: null,
    active: true,
  },
]
