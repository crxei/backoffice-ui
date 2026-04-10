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
