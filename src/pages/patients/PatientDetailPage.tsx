import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { differenceInYears, parseISO, format } from 'date-fns'
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react'
import { usePatient } from '../../hooks/usePatients'
import { useAppointments } from '../../hooks/useAppointments'
import { useCarePlans } from '../../hooks/useCarePlans'
import { useNotifications } from '../../hooks/useNotifications'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { providers } from '../../data/providers'

const vitals = [
  { date: '2024-02-20', type: 'Blood Pressure', value: '128/82 mmHg' },
  { date: '2024-02-20', type: 'Weight', value: '182 lbs' },
  { date: '2024-02-20', type: 'Blood Glucose', value: '142 mg/dL' },
  { date: '2024-01-15', type: 'Blood Pressure', value: '135/88 mmHg' },
  { date: '2024-01-15', type: 'Weight', value: '185 lbs' },
  { date: '2024-01-15', type: 'A1C', value: '7.8%' },
]

const medications = [
  { name: 'Metformin 1000mg', frequency: 'Twice daily', prescribedBy: 'Dr. James Okafor', startDate: '2023-01-20' },
  { name: 'Lisinopril 10mg', frequency: 'Once daily', prescribedBy: 'Dr. James Okafor', startDate: '2023-01-20' },
  { name: 'Atorvastatin 40mg', frequency: 'Once daily at bedtime', prescribedBy: 'Dr. James Okafor', startDate: '2023-03-05' },
]

const tabs = ['Overview', 'Clinical Data', 'Appointments', 'Care Plans', 'Communications']

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const { data: patient, isLoading } = usePatient(id ?? '')
  const { data: appointments } = useAppointments()
  const { data: carePlans } = useCarePlans()
  const { data: notifications } = useNotifications()

  if (isLoading) return <PageLoader />
  if (!patient) return <div className="text-center py-20 text-gray-500">Patient not found</div>

  const age = differenceInYears(new Date(), parseISO(patient.dob))
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`
  const provider = providers.find((p) => p.id === patient.primaryProvider)
  const patientApts = (appointments ?? []).filter((a) => a.patientId === id)
  const patientCPs = (carePlans ?? []).filter((cp) => cp.patientId === id)
  const patientNotifs = (notifications ?? []).filter((n) => n.patientId === id)

  return (
    <div>
      <button onClick={() => navigate('/patients')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Registry
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{patient.firstName} {patient.lastName}</h1>
              <StatusBadge status={patient.riskLevel} />
              <StatusBadge status={patient.consentStatus} />
            </div>
            <p className="text-sm text-gray-500">{patient.mrn} · {age} years · {patient.gender} · DOB {format(parseISO(patient.dob), 'MMM d, yyyy')}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{patient.phone}</span>
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{patient.email}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{patient.address.city}, {patient.address.state}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Demographics</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Address</dt><dd className="text-gray-900 text-right">{patient.address.street}, {patient.address.city}, {patient.address.state} {patient.address.zip}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Gender</dt><dd className="text-gray-900 capitalize">{patient.gender}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Enrollment</dt><dd className="text-gray-900">{format(parseISO(patient.enrollmentDate), 'MMM d, yyyy')}</dd></div>
            </dl>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Insurance</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Payer</dt><dd className="text-gray-900">{patient.insurance.payer}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Plan</dt><dd className="text-gray-900">{patient.insurance.plan}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Member ID</dt><dd className="text-gray-900">{patient.insurance.memberId}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Group #</dt><dd className="text-gray-900">{patient.insurance.groupNumber}</dd></div>
            </dl>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Conditions</h3>
            <div className="flex flex-wrap gap-2">
              {patient.conditions.map((c) => (
                <span key={c} className="px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded-full">{c}</span>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Primary Provider</h3>
            {provider ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{provider.name}</p>
                <p className="text-xs text-gray-500">{provider.specialty}</p>
                <p className="text-xs text-gray-500">{provider.location}</p>
                <p className="text-xs text-gray-500">{provider.phone}</p>
              </div>
            ) : <p className="text-sm text-gray-500">No provider assigned</p>}
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Vitals</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead><tr className="text-xs text-gray-500 uppercase"><th className="pb-2 pr-4 text-left">Date</th><th className="pb-2 pr-4 text-left">Type</th><th className="pb-2 text-left">Value</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {vitals.map((v, i) => (
                    <tr key={i}><td className="py-2 pr-4 text-gray-500">{v.date}</td><td className="py-2 pr-4 font-medium">{v.type}</td><td className="py-2">{v.value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Current Medications</h3>
            <div className="space-y-3">
              {medications.map((med, i) => (
                <div key={i} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div><p className="text-sm font-medium text-gray-900">{med.name}</p><p className="text-xs text-gray-500">{med.frequency} · Since {med.startDate}</p></div>
                  <p className="text-xs text-gray-500">{med.prescribedBy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Appointments</h3>
          {patientApts.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No appointments</p> : (
            <div className="space-y-2">
              {patientApts.sort((a, b) => b.dateTime.localeCompare(a.dateTime)).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div><p className="text-sm font-medium text-gray-900">{format(parseISO(apt.dateTime), 'MMM d, yyyy h:mm a')}</p><p className="text-xs text-gray-500">{apt.type.replace('_', ' ')} · {apt.location}</p></div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Care Plans</h3>
          {patientCPs.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No care plans</p> : (
            <div className="space-y-3">
              {patientCPs.map((cp) => (
                <div key={cp.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">{cp.title}</p>
                    <StatusBadge status={cp.status} />
                  </div>
                  <p className="text-xs text-gray-500">{cp.goals.length} goals · Target: {format(parseISO(cp.targetDate), 'MMM d, yyyy')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 4 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Communications</h3>
          {patientNotifs.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No communications</p> : (
            <div className="space-y-2">
              {patientNotifs.map((n) => (
                <div key={n.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0"><p className="text-sm font-medium text-gray-900 capitalize">{n.type.replace(/_/g, ' ')}</p><p className="text-xs text-gray-500">{n.channel.toUpperCase()} · {n.scheduledAt.split('T')[0]}</p><p className="text-xs text-gray-600 mt-0.5 truncate max-w-xs">{n.message}</p></div>
                  <StatusBadge status={n.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
