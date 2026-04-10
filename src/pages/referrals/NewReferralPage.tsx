import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCreateReferral } from '../../hooks/useReferrals'
import { usePatients } from '../../hooks/usePatients'
import { PageHeader } from '../../components/shared/PageHeader'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { toast } from '../../components/shared/Toast'
import { providers } from '../../data/providers'

const schema = z.object({
  patientId: z.string().min(1),
  referringProvider: z.string().min(1),
  receivingProvider: z.string().min(1),
  specialty: z.string().min(1),
  urgency: z.enum(['routine', 'urgent', 'emergent']),
  expectedDate: z.string().min(1),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

export function NewReferralPage() {
  const navigate = useNavigate()
  const { data: patients } = usePatients()
  const createMutation = useCreateReferral()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { urgency: 'routine' },
  })

  const inputClass = (err?: { message?: string }) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${err ? 'border-red-400' : 'border-gray-300'}`

  const onSubmit = async (data: FormData) => {
    try {
      const ref = await createMutation.mutateAsync({
        ...data,
        status: 'sent',
        sentDate: new Date().toISOString().split('T')[0],
        completedDate: null,
      })
      toast('success', 'Referral Sent', `${ref.id} created`)
      navigate('/referrals')
    } catch { toast('error', 'Referral Failed') }
  }

  return (
    <div>
      <button onClick={() => navigate('/referrals')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Referrals
      </button>
      <PageHeader title="New Referral" />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            <select {...register('patientId')} className={inputClass(errors.patientId)}>
              <option value="">Select patient</option>
              {(patients ?? []).map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.mrn}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referring Provider *</label>
              <select {...register('referringProvider')} className={inputClass(errors.referringProvider)}>
                <option value="">Select provider</option>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receiving Provider *</label>
              <select {...register('receivingProvider')} className={inputClass(errors.receivingProvider)}>
                <option value="">Select provider</option>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
              <input {...register('specialty')} placeholder="e.g. Cardiology" className={inputClass(errors.specialty)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgency *</label>
              <select {...register('urgency')} className={inputClass(errors.urgency)}>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergent">Emergent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Appointment Date *</label>
            <input type="date" {...register('expectedDate')} className={inputClass(errors.expectedDate)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Referral *</label>
            <textarea {...register('reason')} rows={4} className={inputClass(errors.reason)} placeholder="Clinical rationale..." />
            {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason.message}</p>}
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <button type="button" onClick={() => navigate('/referrals')} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70">
            {isSubmitting && <LoadingSpinner size="sm" />}
            Send Referral
          </button>
        </div>
      </form>
    </div>
  )
}
