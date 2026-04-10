import { workflowRuns as wfData, type WorkflowRun } from '../data/workflows'
import { callOpenFn } from './openFnClient'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
let wfStore = [...wfData]

export async function fetchWorkflowRuns(): Promise<WorkflowRun[]> {
  await delay(300)
  return [...wfStore]
}

export async function retryWorkflowRun(id: string): Promise<WorkflowRun> {
  const existing = wfStore.find((w) => w.id === id)
  if (!existing) throw new Error(`Workflow run ${id} not found`)
  const updated: WorkflowRun = {
    ...existing,
    status: 'success',
    completedAt: new Date().toISOString(),
    retryCount: existing.retryCount + 1,
    errorMessage: null,
    durationMs: 400 + Math.floor(Math.random() * 600),
  }
  const result = await callOpenFn(existing.workflowName, { retryOf: id }, updated)
  wfStore = wfStore.map((w) => (w.id === id ? result : w))
  return result
}
