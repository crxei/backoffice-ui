import { useState } from 'react'
import { format, parseISO, startOfWeek, addDays, isSameDay } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight, List, Grid } from 'lucide-react'
import { useAppointments } from '../../hooks/useAppointments'
import { usePatients } from '../../hooks/usePatients'
import { PageHeader } from '../../components/shared/PageHeader'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { DataTable, type Column } from '../../components/shared/DataTable'
import { type Appointment } from '../../data/appointments'

const typeColors: Record<string, string> = {
  primary_care: 'bg-blue-500',
  specialist: 'bg-purple-500',
  follow_up: 'bg-green-500',
  telehealth: 'bg-teal-500',
  wellness: 'bg-orange-400',
}

export function SchedulingPage() {
  const navigate = useNavigate()
  const { data: appointments, isLoading } = useAppointments()
  const { data: patients } = usePatients()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }))
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)

  if (isLoading) return <PageLoader />

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getPatientName = (id: string) => {
    const p = (patients ?? []).find((x) => x.id === id)
    return p ? `${p.firstName} ${p.lastName}` : id
  }

  const aptsForDay = (day: Date) =>
    (appointments ?? []).filter((a) => isSameDay(parseISO(a.dateTime), day))

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'patient', header: 'Patient', render: (r) => <span>{getPatientName((r as unknown as Appointment).patientId)}</span> },
    { key: 'dateTime', header: 'Date & Time', sortable: true, render: (r) => format(parseISO((r as unknown as Appointment).dateTime), 'MMM d, yyyy h:mm a') },
    { key: 'type', header: 'Type', render: (r) => <span className="capitalize">{(r as unknown as Appointment).type.replace('_', ' ')}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={(r as unknown as Appointment).status} /> },
    { key: 'location', header: 'Location' },
  ]

  return (
    <div>
      <PageHeader
        title="Scheduling"
        description="Manage appointments and availability"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {viewMode === 'calendar' ? <><List className="h-4 w-4" /> List</> : <><Grid className="h-4 w-4" /> Calendar</>}
            </button>
            <button
              onClick={() => navigate('/scheduling/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> New Appointment
            </button>
          </div>
        }
      />

      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Week navigation */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-gray-900">
              {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {weekDays.map((day) => (
              <div key={day.toISOString()} className={`p-3 text-center ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}>
                <p className="text-xs font-medium text-gray-500">{format(day, 'EEE')}</p>
                <p className={`text-sm font-bold ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'}`}>{format(day, 'd')}</p>
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="grid grid-cols-7 min-h-[400px]">
            {weekDays.map((day) => {
              const dayApts = aptsForDay(day)
              return (
                <div key={day.toISOString()} className={`p-2 border-r border-gray-100 last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-blue-50/30' : ''}`}>
                  {dayApts.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => setSelectedApt(apt)}
                      className={`w-full text-left p-2 rounded-lg mb-1.5 text-white text-xs ${typeColors[apt.type] ?? 'bg-gray-500'} hover:opacity-90 transition-opacity`}
                    >
                      <p className="font-semibold truncate">{getPatientName(apt.patientId)}</p>
                      <p className="opacity-90">{format(parseISO(apt.dateTime), 'h:mm a')}</p>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-gray-200 flex flex-wrap gap-3">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`h-3 w-3 rounded-sm ${color}`} />
                <span className="text-xs text-gray-600 capitalize">{type.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={(appointments ?? []).map((a) => ({ ...a } as unknown as Record<string, unknown>))}
          searchable
          searchPlaceholder="Search appointments..."
          onRowClick={(row) => navigate(`/scheduling/${(row as unknown as Appointment).id}`)}
        />
      )}

      {/* Detail side panel */}
      {selectedApt && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1" onClick={() => setSelectedApt(null)} />
          <div className="w-80 bg-white shadow-xl border-l border-gray-200 p-5 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Appointment Details</h3>
              <button onClick={() => setSelectedApt(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
            </div>
            <div className="space-y-3 text-sm">
              <div><p className="text-gray-500 text-xs">Patient</p><p className="font-medium">{getPatientName(selectedApt.patientId)}</p></div>
              <div><p className="text-gray-500 text-xs">Date & Time</p><p className="font-medium">{format(parseISO(selectedApt.dateTime), 'MMM d, yyyy h:mm a')}</p></div>
              <div><p className="text-gray-500 text-xs">Type</p><p className="capitalize">{selectedApt.type.replace('_', ' ')}</p></div>
              <div><p className="text-gray-500 text-xs">Status</p><StatusBadge status={selectedApt.status} /></div>
              <div><p className="text-gray-500 text-xs">Duration</p><p>{selectedApt.duration} min</p></div>
              <div><p className="text-gray-500 text-xs">Location</p><p>{selectedApt.location}</p></div>
              {selectedApt.notes && <div><p className="text-gray-500 text-xs">Notes</p><p className="text-gray-700">{selectedApt.notes}</p></div>}
              <div className="flex gap-2 pt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${selectedApt.reminderSent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {selectedApt.reminderSent ? 'Reminder sent' : 'No reminder'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${selectedApt.eligibilityVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {selectedApt.eligibilityVerified ? 'Eligible' : 'Eligibility pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
