import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { useCreateAppointment } from '../../hooks/useAppointments'
import { usePatients } from '../../hooks/usePatients'
import { PageHeader } from '../../components/shared/PageHeader'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { toast } from '../../components/shared/Toast'
import { providers } from '../../data/providers'

const schema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  providerId: z.string().min(1, 'Provider is required'),
  type: z.enum(['primary_care', 'specialist', 'follow_up', 'telehealth', 'wellness']),
  dateTime: z.string().min(1, 'Date and time required'),
  durationStr: z.string().min(1),
  location: z.string().min(1, 'Location required'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function NewAppointmentPage() {
  const navigate = useNavigate()
  const { data: patients } = usePatients()
  const createMutation = useCreateAppointment()
  const [eligibilityChecking, setEligibilityChecking] = useState(false)
  const [eligibilityResult, setEligibilityResult] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [confirmedId, setConfirmedId] = useState('')

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'follow_up', durationStr: '30' },
  })

  const watchedPatient = watch('patientId')

  const checkEligibility = async () => {
    if (!watchedPatient) return
    setEligibilityChecking(true)
    await new Promise((r) => setTimeout(r, 1000))
    const eligible = Math.random() > 0.15
    setEligibilityResult(eligible ? 'eligible' : 'not-eligible')
    setEligibilityChecking(false)
  }

  const onSubmit = async (data: FormData) => {
    if (!eligibilityResult) {
      await checkEligibility()
    }
    try {
      const apt = await createMutation.mutateAsync({
        patientId: data.patientId,
        providerId: data.providerId,
        type: data.type,
        dateTime: data.dateTime,
        duration: parseInt(data.durationStr, 10),
        location: data.location,
        notes: data.notes ?? '',
        status: 'scheduled',
        reminderSent: false,
        eligibilityVerified: eligibilityResult === 'eligible',
      })
      setConfirmed(true)
      setConfirmedId(apt.id)
      toast('success', 'Appointment Booked', `Appointment ${apt.id} confirmed`)
    } catch {
      toast('error', 'Booking Failed', 'Please try again')
    }
  }

  const inputClass = (err?: { message?: string }) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${err ? 'border-red-400' : 'border-gray-300'}`

  if (confirmed) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center bg-white rounded-xl border border-gray-200 p-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Appointment Booked!</h2>
        <p className="mt-2 text-sm text-gray-600">Appointment ID: <span className="font-mono font-semibold">{confirmedId}</span></p>
        <p className="text-sm text-gray-600 mt-1">Reminder notification scheduled ✓</p>
        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={() => navigate('/scheduling')} className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">View Schedule</button>
          <button onClick={() => { setConfirmed(false); setEligibilityResult(null) }} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Book Another</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => navigate('/scheduling')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Schedule
      </button>
      <PageHeader title="New Appointment" />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            <select {...register('patientId')} className={inputClass(errors.patientId)}>
              <option value="">Select patient</option>
              {(patients ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.mrn}</option>
              ))}
            </select>
            {errors.patientId && <p className="mt-1 text-xs text-red-600">{errors.patientId.message}</p>}
          </div>

          {watchedPatient && !eligibilityResult && (
            <div className="flex items-center gap-3">
              <button type="button" onClick={checkEligibility} disabled={eligibilityChecking} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-60">
                {eligibilityChecking && <LoadingSpinner size="sm" />}
                {eligibilityChecking ? 'Checking eligibility...' : 'Check Insurance Eligibility'}
              </button>
            </div>
          )}
          {eligibilityResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${eligibilityResult === 'eligible' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <CheckCircle className={`h-4 w-4 ${eligibilityResult === 'eligible' ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm font-medium ${eligibilityResult === 'eligible' ? 'text-green-800' : 'text-red-800'}`}>
                {eligibilityResult === 'eligible' ? 'Patient is eligible — Coverage active' : 'Eligibility issue — Verify manually'}
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
            <select {...register('providerId')} className={inputClass(errors.providerId)}>
              <option value="">Select provider</option>
              {providers.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.specialty}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select {...register('type')} className={inputClass(errors.type)}>
                <option value="primary_care">Primary Care</option>
                <option value="specialist">Specialist</option>
                <option value="follow_up">Follow-Up</option>
                <option value="telehealth">Telehealth</option>
                <option value="wellness">Wellness</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
              <select {...register('durationStr')} className={inputClass()}>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
                <option value="120">120 min</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
            <input type="datetime-local" {...register('dateTime')} className={inputClass(errors.dateTime)} />
            {errors.dateTime && <p className="mt-1 text-xs text-red-600">{errors.dateTime.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input {...register('location')} placeholder="e.g. Main Campus, Room 210" className={inputClass(errors.location)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea {...register('notes')} rows={3} className={inputClass()} placeholder="Optional appointment notes" />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/scheduling')} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70">
            {isSubmitting && <LoadingSpinner size="sm" />}
            Book Appointment
          </button>
        </div>
      </form>
    </div>
  )
}
