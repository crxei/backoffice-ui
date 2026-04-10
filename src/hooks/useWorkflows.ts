import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWorkflowRuns, retryWorkflowRun } from '../api/workflows'

export function useWorkflows() {
  return useQuery({ queryKey: ['workflows'], queryFn: fetchWorkflowRuns })
}

export function useRetryWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => retryWorkflowRun(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workflows'] }),
  })
}
