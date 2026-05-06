import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchImports,
  fetchImport,
  uploadRemittance,
  fetchImportLines,
  fetchProviderSummary,
  fetchMissingRates,
  approveImport,
  markExported,
  markPaid,
  recomputePayments,
} from '../api/remittances'

export function useImports() {
  return useQuery({ queryKey: ['remittance-imports'], queryFn: fetchImports })
}

export function useImport(importId: string) {
  return useQuery({
    queryKey: ['remittance-imports', importId],
    queryFn: () => fetchImport(importId),
    enabled: !!importId,
  })
}

export function useUploadRemittance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => uploadRemittance(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['remittance-imports'] }),
  })
}

export function useImportLines(importId: string) {
  return useQuery({
    queryKey: ['remittance-lines', importId],
    queryFn: () => fetchImportLines(importId),
    enabled: !!importId,
  })
}

export function useProviderSummary(importId: string) {
  return useQuery({
    queryKey: ['provider-summary', importId],
    queryFn: () => fetchProviderSummary(importId),
    enabled: !!importId,
  })
}

export function useMissingRates(importId: string) {
  return useQuery({
    queryKey: ['missing-rates', importId],
    queryFn: () => fetchMissingRates(importId),
    enabled: !!importId,
  })
}

function useImportAction(fn: (id: string) => Promise<unknown>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['remittance-imports'] }),
  })
}

export const useApproveImport = () => useImportAction(approveImport)
export const useMarkExported = () => useImportAction(markExported)
export const useMarkPaid = () => useImportAction(markPaid)

export function useRecomputePayments() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: recomputePayments,
    onSuccess: (_data, importId) => {
      qc.invalidateQueries({ queryKey: ['remittance-imports', importId] })
      qc.invalidateQueries({ queryKey: ['provider-summary', importId] })
      qc.invalidateQueries({ queryKey: ['missing-rates', importId] })
    },
  })
}
