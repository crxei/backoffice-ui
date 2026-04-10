import { appointments as aptsData, type Appointment } from '../data/appointments'
import { callOpenFn } from './openFnClient'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
let aptsStore = [...aptsData]

export async function fetchAppointments(): Promise<Appointment[]> {
  await delay(300)
  return [...aptsStore]
}

export async function fetchAppointmentById(id: string): Promise<Appointment | undefined> {
  await delay(300)
  return aptsStore.find((a) => a.id === id)
}

export async function createAppointment(data: Omit<Appointment, 'id'>): Promise<Appointment> {
  const newId = `APT-${String(aptsStore.length + 1).padStart(3, '0')}`
  const apt: Appointment = { id: newId, ...data }
  const result = await callOpenFn('appointment-booking', { appointment: apt }, apt)
  aptsStore = [...aptsStore, result]
  return result
}

export async function updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
  const existing = aptsStore.find((a) => a.id === id)
  if (!existing) throw new Error(`Appointment ${id} not found`)
  const updated = { ...existing, ...data }
  const result = await callOpenFn('appointment-update', { id, data }, updated)
  aptsStore = aptsStore.map((a) => (a.id === id ? result : a))
  return result
}
