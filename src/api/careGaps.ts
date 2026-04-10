import { careGaps as gapsData, type CareGap } from '../data/careGaps'
import { callOpenFn } from './openFnClient'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
let gapsStore = [...gapsData]

export async function fetchCareGaps(): Promise<CareGap[]> {
  await delay(300)
  return [...gapsStore]
}

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
