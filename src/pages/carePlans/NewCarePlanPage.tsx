import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCreateCarePlan } from '../../hooks/useCarePlans'
import { usePatients } from '../../hooks/usePatients'
import { useAuthStore } from '../../store/authStore'
import { PageHeader } from '../../components/shared/PageHeader'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { toast } from '../../components/shared/Toast'
import { providers } from '../../data/providers'

const schema = z.object({
  patientId: z.string().min(1, 'Patient required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  assignedClinician: z.string().min(1, 'Clinician required'),
  targetDate: z.string().min(1, 'Target date required'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function NewCarePlanPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: patients } = usePatients()
  const createMutation = useCreateCarePlan()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const inputClass = (err?: { message?: string }) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${err ? 'border-red-400' : 'border-gray-300'}`

  const onSubmit = async (data: FormData) => {
    try {
      const cp = await createMutation.mutateAsync({
        patientId: data.patientId,
        title: data.title,
        status: 'draft',
        createdBy: user?.id ?? 'U-001',
        assignedClinician: data.assignedClinician,
        createdDate: new Date().toISOString().split('T')[0],
        targetDate: data.targetDate,
        goals: [],
        tasks: [],
        notes: data.notes ?? '',
      })
      toast('success', 'Care Plan Created', `${cp.id} created as draft`)
      navigate(`/care-plans/${cp.id}`)
    } catch {
      toast('error', 'Creation Failed', 'Please try again')
    }
  }

  return (
    <div>
      <button onClick={() => navigate('/care-plans')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Care Plans
      </button>
      <PageHeader title="New Care Plan" />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            <select {...register('patientId')} className={inputClass(errors.patientId)}>
              <option value="">Select patient</option>
              {(patients ?? []).map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.mrn}</option>)}
            </select>
            {errors.patientId && <p className="mt-1 text-xs text-red-600">{errors.patientId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Care Plan Title *</label>
            <input {...register('title')} className={inputClass(errors.title)} placeholder="e.g. Diabetes & Hypertension Management Plan" />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Clinician *</label>
            <select {...register('assignedClinician')} className={inputClass(errors.assignedClinician)}>
              <option value="">Select clinician</option>
              {providers.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.specialty}</option>)}
            </select>
            {errors.assignedClinician && <p className="mt-1 text-xs text-red-600">{errors.assignedClinician.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Completion Date *</label>
            <input type="date" {...register('targetDate')} className={inputClass(errors.targetDate)} />
            {errors.targetDate && <p className="mt-1 text-xs text-red-600">{errors.targetDate.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea {...register('notes')} rows={4} className={inputClass()} placeholder="Clinical notes, care context..." />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <button type="button" onClick={() => navigate('/care-plans')} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70">
            {isSubmitting && <LoadingSpinner size="sm" />}
            Create Draft
          </button>
        </div>
      </form>
    </div>
  )
}
