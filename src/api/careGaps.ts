import { careGaps as gapsData, type CareGap, type CareGapListItem } from '../data/careGaps'
import { callOpenFn, postToOpenFn } from './openFnClient'

const CARE_GAPS_LIST_WEBHOOK = '87b6b781-ccff-4173-8693-f6dd7f3a0878'

interface ApiCareGapsResponse {
  data: {
    gaps: Array<{
      id: string
      carePlanId: string
      patient: { id: string; name: string; mrn: string }
      owner: { id?: string; name: string }
      assignedTeamType: string
      priority: string
      status: string
      description: string
      protocolName: string
      dueDate: string
      daysOverdue: number
      estimatedRevenue: number
      revenueCode: string
      outreachAttempts: number
      lastUpdated: string
    }>
    summary: {
      byPriority: { stat: number; urgent: number; asap: number; routine: number }
      byStatus: { inProgress: number; requested: number }
    }
    total: number
    page: number
    pageSize: number
  }
  meta: { state: string }
}

export async function fetchCareGaps(): Promise<CareGapListItem[]> {
  const response = await postToOpenFn<ApiCareGapsResponse>(CARE_GAPS_LIST_WEBHOOK, {})
  return response.data.gaps.map((g) => ({
    id: g.id,
    carePlanId: g.carePlanId,
    patient: g.patient,
    owner: g.owner,
    assignedTeamType: (g.assignedTeamType ?? 'doctor') as CareGapListItem['assignedTeamType'],
    priority: (g.priority ?? 'routine') as CareGapListItem['priority'],
    status: (g.status ?? 'requested') as CareGapListItem['status'],
    description: g.description,
    protocolName: g.protocolName,
    dueDate: g.dueDate,
    daysOverdue: g.daysOverdue ?? 0,
    estimatedRevenue: g.estimatedRevenue ?? 0,
    revenueCode: g.revenueCode ?? '',
    outreachAttempts: g.outreachAttempts ?? 0,
    lastUpdated: g.lastUpdated,
  }))
}

let gapsStore = [...gapsData]

export async function resolveCareGap(id: string): Promise<CareGap> {
  return callOpenFn('careGap.resolve', { id }, (() => {
    const idx = gapsStore.findIndex((g) => g.id === id)
    if (idx === -1) throw new Error('Gap not found')
    gapsStore[idx] = { ...gapsStore[idx], status: 'resolved', resolvedAt: new Date().toISOString() }
    return gapsStore[idx]
  })())
}

export async function assignCareGap(id: string, assignedTo: string): Promise<CareGap> {
  return callOpenFn('careGap.assign', { id, assignedTo }, (() => {
    const idx = gapsStore.findIndex((g) => g.id === id)
    if (idx === -1) throw new Error('Gap not found')
    gapsStore[idx] = { ...gapsStore[idx], assignedTo, status: 'scheduled' }
    return gapsStore[idx]
  })())
}
