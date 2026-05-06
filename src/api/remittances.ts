import {
  type RemittanceImport,
  type RemittanceImportStatus,
  type RemittanceLine,
  type ProviderSummaryRow,
  type MissingRate,
  type UploadRemittanceResponse,
} from '../data/remittance'
import { middlewareGet, middlewarePost, middlewareUpload } from './middlewareClient'

interface ApiImport {
  id: string
  status: string
  originalFileName: string
  created: string
  updated: string
  totalRows: number
  paidRows: number
  deniedRows: number
  payableRows: number
  extractedAmountPaid: string
  expectedClaimPaymentAmount: string
  amountPaidDifference: string
  passedAmountPaid: boolean
  passedAmountBilled: boolean
  remittanceAdviceNumber?: string
  remitDate?: string
  fileHash?: string
}

interface ImportsPage {
  page: number
  total: number
  pageSize: number
  imports: ApiImport[]
}

function mapApiImport(r: ApiImport): RemittanceImport {
  return {
    id: r.id,
    status: r.status as RemittanceImportStatus,
    filename: r.originalFileName,
    createdAt: r.created,
    updatedAt: r.updated,
    duplicate: false,
    summary: {
      totalRows: r.totalRows,
      paidRows: r.paidRows,
      deniedRows: r.deniedRows,
      payableRows: r.payableRows,
      extractedAmountPaid: parseFloat(r.extractedAmountPaid),
      expectedClaimPaymentAmount: parseFloat(r.expectedClaimPaymentAmount),
      amountPaidDifference: parseFloat(r.amountPaidDifference),
      passedAmountPaid: r.passedAmountPaid,
      passedAmountBilled: r.passedAmountBilled,
    },
  }
}

export async function fetchImports(): Promise<RemittanceImport[]> {
  const data = await middlewareGet<ImportsPage>('/api/imports')
  return (data.imports ?? []).map(mapApiImport)
}

export async function fetchImport(importId: string): Promise<RemittanceImport> {
  const data = await middlewareGet<ApiImport>(`/api/imports/${importId}`)
  return mapApiImport(data)
}

export async function uploadRemittance(formData: FormData): Promise<UploadRemittanceResponse> {
  return middlewareUpload<UploadRemittanceResponse>('/api/imports', formData)
}

interface ApiRemittanceLine {
  id: string
  importId: string
  claimId: string
  memberName: string
  serviceProviderId: string
  serviceProviderName: string
  serviceDateFrom: string
  serviceCode: string
  units: number
  amountBilled: string
  amountPaid: string
  lineStatus: string
  reason?: string
  remarkCode?: string
}

interface RemittanceLinesPage {
  page: number
  total: number
  pageSize: number
  remittances: ApiRemittanceLine[]
}

function mapApiLine(r: ApiRemittanceLine): RemittanceLine {
  return {
    id: r.id,
    importId: r.importId,
    tcn: r.claimId,
    patientName: r.memberName,
    serviceProviderId: r.serviceProviderId,
    serviceProviderName: r.serviceProviderName,
    dateOfService: r.serviceDateFrom,
    serviceCode: r.serviceCode,
    modifiers: '',
    units: r.units,
    amountBilled: parseFloat(r.amountBilled),
    amountPaid: parseFloat(r.amountPaid),
    status: r.lineStatus === 'DENY' ? 'DENY' : 'PAID',
    eobCode: r.remarkCode,
    eobReason: r.reason,
  }
}

export async function fetchImportLines(importId: string): Promise<RemittanceLine[]> {
  const first = await middlewareGet<RemittanceLinesPage>(
    `/api/remittances?filter=importId:eq:${importId}&pageSize=100`,
  )
  const allLines = [...first.remittances]
  const totalPages = Math.ceil(first.total / first.pageSize)
  for (let page = 2; page <= totalPages; page++) {
    const next = await middlewareGet<RemittanceLinesPage>(
      `/api/remittances?filter=importId:eq:${importId}&pageSize=100&page=${page}`,
    )
    allLines.push(...next.remittances)
  }
  return allLines.map(mapApiLine)
}

export async function fetchProviderSummary(importId: string): Promise<ProviderSummaryRow[]> {
  return middlewareGet<ProviderSummaryRow[]>(`/api/imports/${importId}/provider-summary`)
}

interface FlaggedRatesPage {
  page: number
  total: number
  pageSize: number
  rates: MissingRate[]
}

export async function fetchMissingRates(_importId: string): Promise<MissingRate[]> {
  const data = await middlewareGet<FlaggedRatesPage>('/api/rates?filter=flagged:eq:true')
  return data.rates ?? []
}

export async function recomputePayments(importId: string): Promise<{ success: boolean }> {
  return middlewarePost<{ success: boolean }>(`/api/imports/${importId}/recompute-payments`, {})
}

export async function approveImport(importId: string): Promise<RemittanceImport> {
  const data = await middlewarePost<ApiImport>(`/api/imports/${importId}/approve`, {})
  return mapApiImport(data)
}

export async function markExported(importId: string): Promise<RemittanceImport> {
  const data = await middlewarePost<ApiImport>(`/api/imports/${importId}/mark-exported`, {})
  return mapApiImport(data)
}

export async function markPaid(importId: string): Promise<RemittanceImport> {
  const data = await middlewarePost<ApiImport>(`/api/imports/${importId}/mark-paid`, {})
  return mapApiImport(data)
}
