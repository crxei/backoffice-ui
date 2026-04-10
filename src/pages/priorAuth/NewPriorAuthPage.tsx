import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCreateClaim } from '../../hooks/useClaims'
import { usePatients } from '../../hooks/usePatients'
import { PageHeader } from '../../components/shared/PageHeader'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { toast } from '../../components/shared/Toast'

const schema = z.object({
  patientId: z.string().min(1, 'Patient required'),
  payer: z.string().min(1, 'Payer required'),
  procedureCode: z.string().min(5, 'Valid procedure code required'),
  diagnosisCode: z.string().min(3, 'Valid diagnosis code required'),
  amount: z.string().min(1, 'Amount required'),
})

type FormData = z.infer<typeof schema>

export function NewPriorAuthPage() {
  const navigate = useNavigate()
  const { data: patients } = usePatients()
  const createMutation = useCreateClaim()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const inputClass = (err?: { message?: string }) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${err ? 'border-red-400' : 'border-gray-300'}`

  const onSubmit = async (data: FormData) => {
    try {
      const claim = await createMutation.mutateAsync({
        patientId: data.patientId,
        payer: data.payer,
        procedureCode: data.procedureCode,
        diagnosisCode: data.diagnosisCode,
        amount: parseFloat(data.amount),
        type: 'prior_auth',
        status: 'submitted',
        submittedDate: new Date().toISOString().split('T')[0],
        decisionDate: null,
        decisionNotes: 'PA submitted via CarePortal. Awaiting payer review.',
      })
      toast('success', 'PA Submitted', `${claim.id} submitted to ${data.payer}`)
      navigate('/prior-auth')
    } catch { toast('error', 'Submission Failed') }
  }

  return (
    <div>
      <button onClick={() => navigate('/prior-auth')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Prior Auth
      </button>
      <PageHeader title="New Prior Authorization Request" />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            <select {...register('patientId')} className={inputClass(errors.patientId)}>
              <option value="">Select patient</option>
              {(patients ?? []).map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.mrn}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payer *</label>
            <select {...register('payer')} className={inputClass(errors.payer)}>
              <option value="">Select payer</option>
              {['Medicare', 'Medicaid', 'BlueCross BlueShield', 'Aetna', 'United Healthcare', 'Cigna'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Procedure Code (CPT) *</label>
              <input {...register('procedureCode')} placeholder="e.g. 93306" className={inputClass(errors.procedureCode)} />
              {errors.procedureCode && <p className="mt-1 text-xs text-red-600">{errors.procedureCode.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis Code (ICD-10) *</label>
              <input {...register('diagnosisCode')} placeholder="e.g. E11.9" className={inputClass(errors.diagnosisCode)} />
              {errors.diagnosisCode && <p className="mt-1 text-xs text-red-600">{errors.diagnosisCode.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Amount ($) *</label>
            <input type="number" {...register('amount')} placeholder="0" className={inputClass(errors.amount)} />
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <button type="button" onClick={() => navigate('/prior-auth')} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70">
            {isSubmitting && <LoadingSpinner size="sm" />} Submit PA Request
          </button>
        </div>
      </form>
    </div>
  )
}
