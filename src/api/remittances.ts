import {
  remittanceImports,
  remittanceLines,
  providerSummary,
  missingRates,
  type RemittanceImport,
  type RemittanceLine,
  type ProviderSummaryRow,
  type MissingRate,
  type UploadRemittanceResponse,
  type RemittanceImportStatus,
} from '../data/remittance'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

let importsStore = [...remittanceImports]

export async function fetchImports(): Promise<RemittanceImport[]> {
  await delay(300)
  return [...importsStore]
}

export async function fetchImport(importId: string): Promise<RemittanceImport> {
  await delay(250)
  const found = importsStore.find((i) => i.id === importId)
  if (!found) throw new Error(`Import ${importId} not found`)
  return { ...found }
}

export async function uploadRemittance(formData: FormData): Promise<UploadRemittanceResponse> {
  await delay(1200)
  const notes = formData.get('notes') as string | null
  const newId = `IMP-${String(importsStore.length + 1).padStart(3, '0')}`
  const now = new Date().toISOString()
  const newImport: RemittanceImport = {
    id: newId,
    status: 'READY_FOR_REVIEW',
    filename: (formData.get('file') as File)?.name ?? 'upload.pdf',
    notes: notes ?? undefined,
    createdAt: now,
    updatedAt: now,
    duplicate: false,
    summary: {
      totalRows: 140,
      paidRows: 115,
      deniedRows: 25,
      payableRows: 112,
      expectedClaimPaymentAmount: 47000,
      extractedAmountPaid: 47000,
      amountPaidDifference: 0,
      passedAmountPaid: true,
      passedAmountBilled: true,
    },
  }
  importsStore = [...importsStore, newImport]
  return {
    duplicate: false,
    importId: newId,
    status: 'READY_FOR_REVIEW',
    summary: newImport.summary,
  }
}

export async function fetchImportLines(importId: string): Promise<RemittanceLine[]> {
  await delay(300)
  return remittanceLines.filter((l) => l.importId === importId)
}

export async function fetchProviderSummary(importId: string): Promise<ProviderSummaryRow[]> {
  await delay(300)
  void importId
  return [...providerSummary]
}

export async function fetchMissingRates(importId: string): Promise<MissingRate[]> {
  await delay(300)
  void importId
  return [...missingRates]
}

async function updateImportStatus(importId: string, status: RemittanceImportStatus): Promise<RemittanceImport> {
  await delay(400)
  const idx = importsStore.findIndex((i) => i.id === importId)
  if (idx === -1) throw new Error(`Import ${importId} not found`)
  const updated = { ...importsStore[idx], status, updatedAt: new Date().toISOString() }
  importsStore = importsStore.map((i) => (i.id === importId ? updated : i))
  return updated
}

export const approveImport = (importId: string) => updateImportStatus(importId, 'APPROVED')
export const markExported = (importId: string) => updateImportStatus(importId, 'EXPORTED')
export const markPaid = (importId: string) => updateImportStatus(importId, 'PAID')

export async function recomputePayments(importId: string): Promise<{ success: boolean }> {
  await delay(800)
  void importId
  return { success: true }
}
