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
