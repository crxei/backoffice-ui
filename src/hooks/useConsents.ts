import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchConsents, createConsent, updateConsent } from '../api/consents'
import { type Consent } from '../data/consents'

export function useConsents() {
  return useQuery({ queryKey: ['consents'], queryFn: fetchConsents })
}

export function useCreateConsent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Consent, 'id'>) => createConsent(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['consents'] }),
  })
}

export function useUpdateConsent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Consent> }) => updateConsent(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['consents'] }),
  })
}
