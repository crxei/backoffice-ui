import { notifications as notifData, type Notification } from '../data/notifications'
import { callOpenFn } from './openFnClient'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
let notifStore = [...notifData]

export async function fetchNotifications(): Promise<Notification[]> {
  await delay(300)
  return [...notifStore]
}

export async function retryNotification(id: string): Promise<Notification> {
  const existing = notifStore.find((n) => n.id === id)
  if (!existing) throw new Error(`Notification ${id} not found`)
  const updated = { ...existing, status: 'sent' as const, sentAt: new Date().toISOString(), retryCount: existing.retryCount + 1 }
  const result = await callOpenFn('reminder-dispatch', { notificationId: id }, updated)
  notifStore = notifStore.map((n) => (n.id === id ? result : n))
  return result
}

export async function createNotification(data: Omit<Notification, 'id'>): Promise<Notification> {
  const newId = `NOT-${String(notifStore.length + 1).padStart(3, '0')}`
  const notif: Notification = { id: newId, ...data }
  const result = await callOpenFn('reminder-dispatch', { notification: notif }, notif)
  notifStore = [...notifStore, result]
  return result
}
