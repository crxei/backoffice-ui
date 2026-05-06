import { useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft } from 'lucide-react'
import { useRate, useCreateRate, useUpdateRate } from '../../hooks/useRates'
import { PageHeader } from '../../components/shared/PageHeader'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { type RateType } from '../../data/rates'

const rateSchema = z.object({
  serviceProviderId: z.string().min(1, 'Provider ID is required'),
  serviceProviderName: z.string().min(1, 'Provider name is required'),
  serviceCode: z.string().min(1, 'Service code is required'),
  modifiers: z.string(),
  rateType: z.enum(['PER_UNIT', 'PER_HOUR', 'PERCENT_OF_PAID', 'FLAT'] as const),
  rate: z.coerce.number().min(0, 'Rate must be 0 or greater'),
  effectiveFrom: z.string().min(1, 'Effective from is required'),
  effectiveTo: z.string().nullable(),
  active: z.boolean(),
})

type RateFormValues = z.infer<typeof rateSchema>

const RATE_TYPE_OPTIONS: { value: RateType; label: string }[] = [
  { value: 'PER_UNIT', label: 'Per Unit' },
  { value: 'PER_HOUR', label: 'Per Hour' },
  { value: 'PERCENT_OF_PAID', label: '% of Paid' },
  { value: 'FLAT', label: 'Flat' },
]

export function RateFormPage() {
  const { rateId } = useParams<{ rateId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEdit = !!rateId

  const { data: existing, isLoading } = useRate(rateId ?? '')
  const { mutate: createRate, isPending: creating } = useCreateRate()
  const { mutate: updateRate, isPending: updating } = useUpdateRate()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RateFormValues>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      serviceProviderId: searchParams.get('serviceProviderId') ?? '',
      serviceProviderName: searchParams.get('serviceProviderName') ?? '',
      serviceCode: searchParams.get('serviceCode') ?? '',
      modifiers: searchParams.get('modifiers') ?? '',
      rateType: 'PER_HOUR',
      rate: 0,
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: null,
      active: true,
    },
  })

  useEffect(() => {
    if (existing) {
      reset({
        ...existing,
        effectiveTo: existing.effectiveTo ?? null,
      })
    }
  }, [existing, reset])

  const rateType = watch('rateType')

  function onSubmit(values: RateFormValues) {
    const data = { ...values, effectiveTo: values.effectiveTo || null }
    if (isEdit) {
      updateRate({ id: rateId!, data }, { onSuccess: () => navigate('/rates') })
    } else {
      createRate(data, { onSuccess: () => navigate('/rates') })
    }
  }

  if (isEdit && isLoading) return <PageLoader />

  const isPending = creating || updating

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate('/rates')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Rates
        </button>
      </div>

      <PageHeader
        title={isEdit ? 'Edit Provider Rate' : 'Add Provider Rate'}
        description={isEdit ? `Editing rate ${rateId}` : 'Configure a new provider payment rate'}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm">Provider</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider ID *</label>
              <input
                {...register('serviceProviderId')}
                placeholder="027282707"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.serviceProviderId && (
                <p className="text-xs text-red-600 mt-1">{errors.serviceProviderId.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name *</label>
              <input
                {...register('serviceProviderName')}
                placeholder="HAYNES, CHAMIR"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.serviceProviderName && (
                <p className="text-xs text-red-600 mt-1">{errors.serviceProviderName.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm">Service</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Code *</label>
              <input
                {...register('serviceCode')}
                placeholder="H0036"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.serviceCode && (
                <p className="text-xs text-red-600 mt-1">{errors.serviceCode.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modifiers</label>
              <input
                {...register('modifiers')}
                placeholder="HQ, HN, …"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm">Rate</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate Type *</label>
              <select
                {...register('rateType')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {RATE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate * {rateType === 'PERCENT_OF_PAID' ? '(%)' : '($)'}
              </label>
              <input
                {...register('rate')}
                type="number"
                step="0.01"
                min="0"
                placeholder={rateType === 'PERCENT_OF_PAID' ? '85' : '50.00'}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.rate && (
                <p className="text-xs text-red-600 mt-1">{errors.rate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective From *</label>
              <input
                {...register('effectiveFrom')}
                type="date"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.effectiveFrom && (
                <p className="text-xs text-red-600 mt-1">{errors.effectiveFrom.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective To</label>
              <input
                {...register('effectiveTo')}
                type="date"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                {...register('active')}
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Rate')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/rates')}
            className="px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
