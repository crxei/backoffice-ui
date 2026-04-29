import { postToOpenFn } from './openFnClient'
import type { SchedulesData } from '../data/schedules'

const SCHEDULES_WEBHOOK = '20c39353-17ef-4c8a-89c6-325d9d32eb56'

interface ApiSchedulesResponse {
  data: SchedulesData
  meta: { state: string }
}

export async function fetchSchedules(): Promise<SchedulesData> {
  const response = await postToOpenFn<ApiSchedulesResponse>(SCHEDULES_WEBHOOK, {})
  return response.data
}
