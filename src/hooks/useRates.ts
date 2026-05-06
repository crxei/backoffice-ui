import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchRates, fetchRate, createRate, updateRate, deleteRate, type RatesFilter } from '../api/rates'
import { type ProviderRate } from '../data/rates'

export function useRates(filters?: RatesFilter) {
  return useQuery({
    queryKey: ['rates', filters],
    queryFn: () => fetchRates(filters),
  })
}

export function useRate(rateId: string) {
  return useQuery({
    queryKey: ['rates', rateId],
    queryFn: () => fetchRate(rateId),
    enabled: !!rateId,
  })
}

export function useCreateRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<ProviderRate, 'id'>) => createRate(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rates'] }),
  })
}

export function useUpdateRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ProviderRate, 'id'>> }) => updateRate(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rates'] }),
  })
}

export function useDeleteRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (rateId: string) => deleteRate(rateId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rates'] }),
  })
}
