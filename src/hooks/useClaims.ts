import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchClaims, createClaim, updateClaim } from '../api/claims'
import { type Claim } from '../data/claims'

export function useClaims() {
  return useQuery({ queryKey: ['claims'], queryFn: fetchClaims })
}

export function useCreateClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Claim, 'id'>) => createClaim(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['claims'] }),
  })
}

export function useUpdateClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Claim> }) => updateClaim(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['claims'] }),
  })
}
