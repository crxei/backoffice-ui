import { carePlans as cpData, type CarePlan, type CarePlanListItem, type CarePlanDetail, type CarePlanStatus } from '../data/carePlans'
import { callOpenFn, postToOpenFn } from './openFnClient'

const CARE_PLANS_LIST_WEBHOOK = '46a8d963-6b37-4a90-8f59-5274e9dfa0e6'

interface ApiCarePlanListResponse {
  data: {
    carePlans: Array<{
      id: string
      title: string
      status: string
      patient: { id: string; name: string; mrn: string }
      clinician: { id?: string; name: string }
      createdDate: string
      targetDate?: string
      lastUpdated: string
      goalsProgress: { total: number; achieved: number; inProgress: number; overdue: number }
    }>
    page: number
    pageSize: number
    total: number
    tabCounts: { all: number; active: number; completed: number; pending_approval: number }
  }
  meta: { state: string }
}

export async function fetchCarePlans(): Promise<CarePlanListItem[]> {
  const response = await postToOpenFn<ApiCarePlanListResponse>(CARE_PLANS_LIST_WEBHOOK, {})
  return response.data.carePlans
    .filter((cp) => cp.patient.mrn !== '' && cp.title !== 'Untitled Care Plan')
    .map((cp) => ({
      id: cp.id,
      title: cp.title,
      status: cp.status as CarePlanListItem['status'],
      patient: cp.patient,
      clinician: cp.clinician,
      createdDate: cp.createdDate,
      targetDate: cp.targetDate,
      lastUpdated: cp.lastUpdated,
      goalsProgress: cp.goalsProgress,
    }))
}

let cpStore = [...cpData]

export async function fetchCarePlanById(id: string): Promise<CarePlan | undefined> {
  return cpStore.find((c) => c.id === id)
}

export async function createCarePlan(data: Omit<CarePlan, 'id'>): Promise<CarePlan> {
  const newId = `CP-${String(cpStore.length + 1).padStart(3, '0')}`
  const cp: CarePlan = { id: newId, ...data }
  const result = await callOpenFn('care-plan-create', { carePlan: cp }, cp)
  cpStore = [...cpStore, result]
  return result
}

export async function updateCarePlan(id: string, data: Partial<CarePlan>): Promise<CarePlan> {
  const existing = cpStore.find((c) => c.id === id)
  if (!existing) throw new Error(`Care plan ${id} not found`)
  const updated = { ...existing, ...data }
  const result = await callOpenFn('care-plan-sync', { id, data }, updated)
  cpStore = cpStore.map((c) => (c.id === id ? result : c))
  return result
}

// ── Care Plan Detail ────────────────────────────────────────────────────────

const CARE_PLAN_DETAIL_WEBHOOK = '156f6612-a0d8-44bb-8f1c-2187a29d7913'

interface ApiCarePlanDetailResponse {
  data: {
    carePlan: {
      id: string
      title: string
      status: string
      intent?: string
      consentObtained?: boolean
      period?: { start: string; end?: string }
      author?: { id?: string; name: string }
      goals?: Array<{
        id: string
        description: string
        achievementStatus?: string
        dueDate?: string
        baselineValue?: number
        targetValue?: number
        targetComparator?: string
        targetUnit?: string
      }>
      activities?: Array<{
        id: string
        display: string
        category: string
        assignedTeamType: string
        authoredOn?: string
        cptCode?: string
        loincCode?: string
        frequency?: { period: number; periodUnit: string }
        status: string
      }>
      addressedConditions?: Array<{ reference: string }>
    }
  }
  meta: { state: string }
}

export async function fetchCarePlanDetail(careId: string): Promise<CarePlanDetail> {
  const response = await postToOpenFn<ApiCarePlanDetailResponse>(CARE_PLAN_DETAIL_WEBHOOK, { careId })
  const cp = response.data.carePlan
  return {
    id: cp.id,
    title: cp.title,
    status: cp.status as CarePlanStatus,
    intent: cp.intent,
    consentObtained: cp.consentObtained,
    period: cp.period,
    author: cp.author ?? { name: 'Unknown' },
    goals: (cp.goals ?? []).map((g) => ({
      id: g.id,
      description: g.description,
      achievementStatus: g.achievementStatus ?? 'in-progress',
      dueDate: g.dueDate ?? '',
      baselineValue: g.baselineValue,
      targetValue: g.targetValue,
      targetComparator: g.targetComparator,
      targetUnit: g.targetUnit,
    })),
    activities: (cp.activities ?? []).map((a) => ({
      id: a.id,
      display: a.display,
      category: a.category,
      assignedTeamType: a.assignedTeamType,
      authoredOn: a.authoredOn,
      cptCode: a.cptCode,
      loincCode: a.loincCode,
      frequency: a.frequency,
      status: a.status,
    })),
    addressedConditions: cp.addressedConditions ?? [],
  }
}
