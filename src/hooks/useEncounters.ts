import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchEncounters, fetchEncounterById, updateEncounter, escalateEncounter } from '../api/encounters'
import { type Encounter } from '../data/encounters'

export function useEncounters() {
  return useQuery({ queryKey: ['encounters'], queryFn: fetchEncounters })
}

export function useEncounter(id: string) {
  return useQuery({ queryKey: ['encounters', id], queryFn: () => fetchEncounterById(id), enabled: !!id })
}

export function useUpdateEncounter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Encounter> }) => updateEncounter(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['encounters'] }),
  })
}

export function useEscalateEncounter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => escalateEncounter(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['encounters'] }),
  })
}
