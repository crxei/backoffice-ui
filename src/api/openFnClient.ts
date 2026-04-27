const OPENFN_BASE = 'http://20.106.204.159/i'

export async function postToOpenFn<T>(webhookId: string, payload: unknown = {}): Promise<T> {
  const res = await fetch(`${OPENFN_BASE}/${webhookId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`OpenFn request failed: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const randomFail = () => Math.random() < 0.1

export async function callOpenFn<T>(
  workflowName: string,
  payload: unknown,
  mockResponse: T
): Promise<T> {
  await delay(200 + Math.random() * 300)
  console.log(`[OpenFn] ${workflowName} triggered`, payload)
  if (randomFail()) {
    throw new Error(`OpenFn workflow "${workflowName}" failed (simulated error)`)
  }
  return mockResponse
}
