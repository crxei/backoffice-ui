import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCreatePatient } from '../../hooks/usePatients'
import { PageHeader } from '../../components/shared/PageHeader'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { toast } from '../../components/shared/Toast'
import { providers } from '../../data/providers'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().min(10, 'Valid phone required'),
  email: z.string().email('Valid email required'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(5, 'ZIP is required'),
  payer: z.string().min(1, 'Insurance payer is required'),
  memberId: z.string().min(1, 'Member ID is required'),
  groupNumber: z.string().min(1, 'Group number is required'),
  plan: z.string().min(1, 'Plan name is required'),
  primaryProvider: z.string().min(1, 'Primary provider is required'),
  riskLevel: z.enum(['low', 'medium', 'high']),
})

type FormData = z.infer<typeof schema>

export function PatientRegistrationPage() {
  const navigate = useNavigate()
  const createMutation = useCreatePatient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gender: 'female', riskLevel: 'low' },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const patient = await createMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        address: { street: data.street, city: data.city, state: data.state, zip: data.zip },
        insurance: { payer: data.payer, memberId: data.memberId, groupNumber: data.groupNumber, plan: data.plan },
        primaryProvider: data.primaryProvider,
        conditions: [],
        consentStatus: 'missing',
        enrollmentDate: new Date().toISOString().split('T')[0],
        riskLevel: data.riskLevel,
      })
      toast('success', 'Patient Registered', `${patient.firstName} ${patient.lastName} (${patient.mrn}) added`)
      navigate(`/patients/${patient.id}`)
    } catch {
      toast('error', 'Registration Failed', 'Please try again')
    }
  }

  const inputClass = (error?: { message?: string }) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-400' : 'border-gray-300'}`

  return (
    <div>
      <button onClick={() => navigate('/patients')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Registry
      </button>
      <PageHeader title="Register New Patient" description="Add a new patient to the system" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Demographics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Demographics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input {...register('firstName')} className={inputClass(errors.firstName)} />
              {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input {...register('lastName')} className={inputClass(errors.lastName)} />
              {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input type="date" {...register('dob')} className={inputClass(errors.dob)} />
              {errors.dob && <p className="mt-1 text-xs text-red-600">{errors.dob.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select {...register('gender')} className={inputClass(errors.gender)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input {...register('phone')} placeholder="(312) 555-0000" className={inputClass(errors.phone)} />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" {...register('email')} className={inputClass(errors.email)} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street *</label>
              <input {...register('street')} className={inputClass(errors.street)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input {...register('city')} className={inputClass(errors.city)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input {...register('state')} maxLength={2} placeholder="IL" className={inputClass(errors.state)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP *</label>
              <input {...register('zip')} className={inputClass(errors.zip)} />
            </div>
          </div>
        </div>

        {/* Insurance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Insurance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payer *</label>
              <select {...register('payer')} className={inputClass(errors.payer)}>
                <option value="">Select payer</option>
                {['Medicare', 'Medicaid', 'BlueCross BlueShield', 'Aetna', 'United Healthcare', 'Cigna'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
              <input {...register('plan')} className={inputClass(errors.plan)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member ID *</label>
              <input {...register('memberId')} className={inputClass(errors.memberId)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Number *</label>
              <input {...register('groupNumber')} className={inputClass(errors.groupNumber)} />
            </div>
          </div>
        </div>

        {/* Care Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Care Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Provider *</label>
              <select {...register('primaryProvider')} className={inputClass(errors.primaryProvider)}>
                <option value="">Select provider</option>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.specialty}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level *</label>
              <select {...register('riskLevel')} className={inputClass(errors.riskLevel)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/patients')} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70">
            {isSubmitting && <LoadingSpinner size="sm" />}
            Register Patient
          </button>
        </div>
      </form>
    </div>
  )
}
