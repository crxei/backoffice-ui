export interface PaidServiceLine {
  dateOfService: string
  patientName: string
  tcn: string
  units: number
  hours: string
  rate: string
  payment: string
  status: 'PAID'
}

export interface DeniedServiceLine {
  dateOfService: string
  patientName: string
  tcn: string
  eobCode: string
  reason: string
  status: 'DENY'
}

export interface ProviderInvoicePreview {
  employeeName: string
  teamName: string
  datePaid: string
  paymentDate: string
  paidOnDate: string
  totalPaidAmount: string
  paidServices: PaidServiceLine[]
  deniedServices: DeniedServiceLine[]
}
