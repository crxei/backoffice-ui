import { useQuery } from '@tanstack/react-query'
import { fetchSchedules } from '../api/schedules'

export function useSchedules() {
  return useQuery({ queryKey: ['schedules'], queryFn: fetchSchedules })
}
