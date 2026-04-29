import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCarePlans, fetchCarePlanById, fetchCarePlanDetail, createCarePlan, updateCarePlan } from '../api/carePlans'
import { type CarePlan, type CarePlanListItem } from '../data/carePlans'

export function useCarePlans() {
  return useQuery<CarePlanListItem[]>({ queryKey: ['carePlans'], queryFn: fetchCarePlans })
}

export function useCarePlan(id: string) {
  return useQuery({ queryKey: ['carePlans', id], queryFn: () => fetchCarePlanById(id), enabled: !!id })
}

export function useCarePlanDetail(id: string) {
  return useQuery({ queryKey: ['care-plan-detail', id], queryFn: () => fetchCarePlanDetail(id), enabled: !!id })
}

export function useCreateCarePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<CarePlan, 'id'>) => createCarePlan(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['carePlans'] }),
  })
}

export function useUpdateCarePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CarePlan> }) => updateCarePlan(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['carePlans'] }),
  })
}
