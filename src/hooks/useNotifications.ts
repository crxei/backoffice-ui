import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchNotifications, retryNotification, createNotification } from '../api/notifications'
import { type Notification } from '../data/notifications'

export function useNotifications() {
  return useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications })
}

export function useRetryNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => retryNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useCreateNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Notification, 'id'>) => createNotification(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
