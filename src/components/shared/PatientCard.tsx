import { differenceInYears, parseISO } from 'date-fns'
import { type Patient } from '../../data/patients'
import { StatusBadge } from './StatusBadge'

interface PatientCardProps {
  patient: Patient
  compact?: boolean
}

export function PatientCard({ patient, compact = false }: PatientCardProps) {
  const age = differenceInYears(new Date(), parseISO(patient.dob))
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {patient.firstName} {patient.lastName}
          </p>
          <p className="text-xs text-gray-500">
            {patient.mrn} · {age}y
          </p>
        </div>
        <StatusBadge status={patient.riskLevel} />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-sm text-gray-500">
                {patient.mrn} · {age} years · {patient.gender}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <StatusBadge status={patient.riskLevel} />
              <StatusBadge status={patient.consentStatus} />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>{patient.phone}</p>
            <p className="text-xs text-gray-400 mt-0.5">{patient.insurance.payer} · {patient.insurance.plan}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
