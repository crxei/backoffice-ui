import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPatients, fetchPatientById, fetchPatientDetail, createPatient, updatePatient } from '../api/patients'
import { type Patient } from '../data/patients'

export function usePatients() {
  return useQuery({ queryKey: ['patients'], queryFn: fetchPatients })
}

export function usePatient(id: string) {
  return useQuery({ queryKey: ['patients', id], queryFn: () => fetchPatientById(id), enabled: !!id })
}

export function usePatientDetail(id: string) {
  return useQuery({ queryKey: ['patient-detail', id], queryFn: () => fetchPatientDetail(id), enabled: !!id })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Patient, 'id' | 'mrn'>) => createPatient(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}

export function useUpdatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) => updatePatient(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}
