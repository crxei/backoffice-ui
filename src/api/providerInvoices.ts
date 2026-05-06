import { type ProviderInvoicePreview } from '../data/providerInvoices'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export interface InvoiceParams {
  importId: string
  serviceProviderId: string
  paymentDate: string
  paidOnDate: string
}

export async function fetchInvoicePreview(params: InvoiceParams): Promise<ProviderInvoicePreview> {
  await delay(500)
  return {
    employeeName: 'HAYNES, CHAMIR',
    teamName: 'CRXEI Health',
    datePaid: params.paymentDate,
    paymentDate: params.paymentDate,
    paidOnDate: params.paidOnDate,
    totalPaidAmount: '$4,400.00',
    paidServices: [
      {
        dateOfService: '2026-04-15',
        patientName: 'Maria Lopez',
        tcn: '2604280001',
        units: 4,
        hours: '4.00',
        rate: '$50.00',
        payment: '$200.00',
        status: 'PAID',
      },
      {
        dateOfService: '2026-04-16',
        patientName: 'James Carter',
        tcn: '2604280002',
        units: 2,
        hours: '2.00',
        rate: '$45.00',
        payment: '$90.00',
        status: 'PAID',
      },
    ],
    deniedServices: [
      {
        dateOfService: '2026-04-17',
        patientName: 'Aisha Washington',
        tcn: '2604280003',
        eobCode: '96',
        reason: 'Non-covered service',
        status: 'DENY',
      },
    ],
  }
}

export async function downloadInvoicePdf(params: InvoiceParams): Promise<Blob> {
  await delay(800)
  const text = `Provider Invoice\nProvider: ${params.serviceProviderId}\nImport: ${params.importId}\nPayment Date: ${params.paymentDate}\nPaid On: ${params.paidOnDate}`
  return new Blob([text], { type: 'application/pdf' })
}

export async function downloadInvoiceCsv(params: InvoiceParams): Promise<Blob> {
  await delay(600)
  const csv = `TCN,Patient,Date of Service,Units,Rate,Payment,Status\n2604280001,Maria Lopez,2026-04-15,4,$50.00,$200.00,PAID`
  return new Blob([csv], { type: 'text/csv' })
}

export async function exportAllInvoices(importId: string): Promise<{ jobId: string; status: 'QUEUED' }> {
  await delay(400)
  return { jobId: `JOB-${importId}-${Date.now()}`, status: 'QUEUED' }
}
