import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCareGaps, resolveCareGap, assignCareGap } from '../api/careGaps'

export function useCareGaps() {
  return useQuery({ queryKey: ['careGaps'], queryFn: fetchCareGaps })
}

export function useResolveCareGap() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resolveCareGap(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['careGaps'] }),
  })
}

export function useAssignCareGap() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string }) => assignCareGap(id, assignedTo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['careGaps'] }),
  })
}
