import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchReferrals, createReferral, updateReferral } from '../api/referrals'
import { type Referral } from '../data/referrals'

export function useReferrals() {
  return useQuery({ queryKey: ['referrals'], queryFn: fetchReferrals })
}

export function useCreateReferral() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Referral, 'id'>) => createReferral(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referrals'] }),
  })
}

export function useUpdateReferral() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Referral> }) => updateReferral(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referrals'] }),
  })
}
