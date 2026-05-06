export type RemittanceImportStatus =
  | 'PROCESSING'
  | 'RECONCILIATION_FAILED'
  | 'MISSING_RATES'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'EXPORTED'
  | 'PAID'

export interface RemittanceImportSummary {
  totalRows: number
  paidRows: number
  deniedRows: number
  payableRows: number
  expectedClaimPaymentAmount: number
  extractedAmountPaid: number
  amountPaidDifference: number
  passedAmountPaid: boolean
  passedAmountBilled: boolean
}

export interface RemittanceImport {
  id: string
  status: RemittanceImportStatus
  filename: string
  notes?: string
  createdAt: string
  updatedAt: string
  duplicate: boolean
  summary: RemittanceImportSummary
}

export interface RemittanceLine {
  id: string
  importId: string
  tcn: string
  patientName: string
  serviceProviderId: string
  serviceProviderName: string
  dateOfService: string
  serviceCode: string
  modifiers: string
  units: number
  amountBilled: number
  amountPaid: number
  status: 'PAID' | 'DENY'
  eobCode?: string
  eobReason?: string
}

export interface ProviderSummaryRow {
  serviceProviderId: string
  serviceProviderName: string
  paidLines: number
  deniedLines: number
  totalUnits: number
  totalAmountPaid: number
  computedProviderPayment: number
  missingRateCount: number
}

export interface MissingRate {
  serviceProviderId: string
  serviceProviderName: string
  serviceCode: string
  modifiers: string
  dateOfService: string
  units: number
  amountPaid: number
}

export interface UploadRemittanceResponse {
  duplicate: boolean
  importId: string
  status: RemittanceImportStatus
  summary?: RemittanceImportSummary
  errors?: string[]
}

const _mockSummary: RemittanceImportSummary = {
  totalRows: 142,
  paidRows: 118,
  deniedRows: 24,
  payableRows: 115,
  expectedClaimPaymentAmount: 48320.5,
  extractedAmountPaid: 48320.5,
  amountPaidDifference: 0,
  passedAmountPaid: true,
  passedAmountBilled: true,
}

export const remittanceImports: RemittanceImport[] = [
  {
    id: 'IMP-001',
    status: 'READY_FOR_REVIEW',
    filename: 'medi-cal-remittance-2026-04-28.pdf',
    notes: 'Weekly batch April 28',
    createdAt: '2026-04-28T10:15:00Z',
    updatedAt: '2026-04-28T10:16:30Z',
    duplicate: false,
    summary: _mockSummary,
  },
  {
    id: 'IMP-002',
    status: 'APPROVED',
    filename: 'medi-cal-remittance-2026-04-21.pdf',
    notes: 'Weekly batch April 21',
    createdAt: '2026-04-21T09:30:00Z',
    updatedAt: '2026-04-21T14:00:00Z',
    duplicate: false,
    summary: {
      ..._mockSummary,
      totalRows: 130,
      paidRows: 110,
      deniedRows: 20,
      payableRows: 108,
      expectedClaimPaymentAmount: 43100.0,
      extractedAmountPaid: 43100.0,
      amountPaidDifference: 0,
    },
  },
  {
    id: 'IMP-003',
    status: 'MISSING_RATES',
    filename: 'medi-cal-remittance-2026-05-05.pdf',
    notes: 'Weekly batch May 5',
    createdAt: '2026-05-05T08:00:00Z',
    updatedAt: '2026-05-05T08:01:10Z',
    duplicate: false,
    summary: {
      ..._mockSummary,
      payableRows: 110,
      passedAmountPaid: true,
    },
  },
  {
    id: 'IMP-004',
    status: 'PAID',
    filename: 'medi-cal-remittance-2026-04-14.pdf',
    createdAt: '2026-04-14T11:00:00Z',
    updatedAt: '2026-04-16T09:00:00Z',
    duplicate: false,
    summary: { ..._mockSummary, paidRows: 95, totalRows: 115 },
  },
]

export const remittanceLines: RemittanceLine[] = [
  {
    id: 'LINE-001',
    importId: 'IMP-001',
    tcn: '2604280001',
    patientName: 'Maria Lopez',
    serviceProviderId: '027282707',
    serviceProviderName: 'HAYNES, CHAMIR',
    dateOfService: '2026-04-15',
    serviceCode: 'H0036',
    modifiers: '',
    units: 4,
    amountBilled: 220.0,
    amountPaid: 200.0,
    status: 'PAID',
  },
  {
    id: 'LINE-002',
    importId: 'IMP-001',
    tcn: '2604280002',
    patientName: 'James Carter',
    serviceProviderId: '027282707',
    serviceProviderName: 'HAYNES, CHAMIR',
    dateOfService: '2026-04-16',
    serviceCode: 'H0036',
    modifiers: 'HQ',
    units: 2,
    amountBilled: 110.0,
    amountPaid: 100.0,
    status: 'PAID',
  },
  {
    id: 'LINE-003',
    importId: 'IMP-001',
    tcn: '2604280003',
    patientName: 'Aisha Washington',
    serviceProviderId: '038491820',
    serviceProviderName: 'TORRES, ELENA',
    dateOfService: '2026-04-17',
    serviceCode: 'T1017',
    modifiers: '',
    units: 8,
    amountBilled: 320.0,
    amountPaid: 0,
    status: 'DENY',
    eobCode: '96',
    eobReason: 'Non-covered service',
  },
]

export const providerSummary: ProviderSummaryRow[] = [
  {
    serviceProviderId: '027282707',
    serviceProviderName: 'HAYNES, CHAMIR',
    paidLines: 22,
    deniedLines: 3,
    totalUnits: 88,
    totalAmountPaid: 4400.0,
    computedProviderPayment: 4400.0,
    missingRateCount: 0,
  },
  {
    serviceProviderId: '038491820',
    serviceProviderName: 'TORRES, ELENA',
    paidLines: 18,
    deniedLines: 5,
    totalUnits: 72,
    totalAmountPaid: 3600.0,
    computedProviderPayment: 3600.0,
    missingRateCount: 0,
  },
  {
    serviceProviderId: '049302910',
    serviceProviderName: 'REYES, CARLOS',
    paidLines: 14,
    deniedLines: 2,
    totalUnits: 56,
    totalAmountPaid: 2800.0,
    computedProviderPayment: 0,
    missingRateCount: 3,
  },
]

export const missingRates: MissingRate[] = [
  {
    serviceProviderId: '049302910',
    serviceProviderName: 'REYES, CARLOS',
    serviceCode: 'H2015',
    modifiers: '',
    dateOfService: '2026-04-15',
    units: 4,
    amountPaid: 180.0,
  },
  {
    serviceProviderId: '049302910',
    serviceProviderName: 'REYES, CARLOS',
    serviceCode: 'H2015',
    modifiers: 'HQ',
    dateOfService: '2026-04-16',
    units: 2,
    amountPaid: 90.0,
  },
]
