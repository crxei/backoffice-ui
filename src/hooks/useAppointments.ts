import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAppointments, fetchAppointmentById, createAppointment, updateAppointment } from '../api/appointments'
import { type Appointment } from '../data/appointments'

export function useAppointments() {
  return useQuery({ queryKey: ['appointments'], queryFn: fetchAppointments })
}

export function useAppointment(id: string) {
  return useQuery({ queryKey: ['appointments', id], queryFn: () => fetchAppointmentById(id), enabled: !!id })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Appointment, 'id'>) => createAppointment(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useUpdateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) => updateAppointment(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}
