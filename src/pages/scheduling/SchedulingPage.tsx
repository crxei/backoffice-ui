import { useState } from 'react'
import { format, parseISO, startOfWeek, addDays, isSameDay, isWithinInterval } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight, List, Grid } from 'lucide-react'
import { useSchedules } from '../../hooks/useSchedules'
import { PageHeader } from '../../components/shared/PageHeader'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { DataTable, type Column } from '../../components/shared/DataTable'
import type { Schedule } from '../../data/schedules'

export function SchedulingPage() {
  const navigate = useNavigate()
  const { data: schedulesData, isLoading } = useSchedules()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }))
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)

  if (isLoading) return <PageLoader />

  const schedules = schedulesData?.schedules ?? []
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const schedulesForDay = (day: Date) =>
    schedules.filter((s) =>
      isWithinInterval(day, {
        start: parseISO(s.planningHorizon.start),
        end: parseISO(s.planningHorizon.end),
      })
    )

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'scheduleId', header: 'Schedule ID', sortable: true },
    {
      key: 'provider',
      header: 'Provider',
      render: (r) => <span>{(r as unknown as Schedule).providers.map((p) => p.name).join(', ')}</span>,
    },
    {
      key: 'specialty',
      header: 'Specialty',
      render: (r) => <span>{(r as unknown as Schedule).providers.map((p) => p.specialty).join(', ')}</span>,
    },
    {
      key: 'serviceTypes',
      header: 'Service Types',
      render: (r) => <span>{(r as unknown as Schedule).serviceTypes.join(', ')}</span>,
    },
    {
      key: 'availableSlots',
      header: 'Slots',
      render: (r) => {
        const s = r as unknown as Schedule
        return (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.availableSlots > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {s.availableSlots} available
          </span>
        )
      },
    },
    {
      key: 'planningHorizon',
      header: 'Planning Horizon',
      render: (r) => {
        const s = r as unknown as Schedule
        return (
          <span>
            {format(parseISO(s.planningHorizon.start), 'MMM d')}
            {' – '}
            {format(parseISO(s.planningHorizon.end), 'MMM d, yyyy')}
          </span>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Scheduling"
        description="Manage appointments and provider availability"
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

          {/* Day columns — one card per available provider */}
          <div className="grid grid-cols-7 min-h-[400px]">
            {weekDays.map((day) => {
              const daySchedules = schedulesForDay(day)
              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 border-r border-gray-100 last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-blue-50/30' : ''}`}
                >
                  {daySchedules.length === 0 ? (
                    <p className="text-xs text-gray-300 text-center mt-6">No availability</p>
                  ) : (
                    daySchedules.map((sched) => (
                      <button
                        key={sched.scheduleId}
                        onClick={() => setSelectedSchedule(sched)}
                        className="w-full text-left p-2 rounded-lg mb-1.5 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                      >
                        {sched.providers.map((p) => (
                          <p key={p.id} className="text-xs font-semibold text-blue-900 truncate">{p.name}</p>
                        ))}
                        <p className="text-xs text-blue-500 mt-0.5">
                          {sched.availableSlots} slot{sched.availableSlots !== 1 ? 's' : ''}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={schedules.map((s) => ({ ...s } as unknown as Record<string, unknown>))}
          searchable
          searchPlaceholder="Search schedules..."
          onRowClick={(row) => setSelectedSchedule(row as unknown as Schedule)}
        />
      )}

      {/* Schedule detail side panel */}
      {selectedSchedule && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1" onClick={() => setSelectedSchedule(null)} />
          <div className="w-80 bg-white shadow-xl border-l border-gray-200 p-5 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Schedule Details</h3>
              <button onClick={() => setSelectedSchedule(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
            </div>
            <div className="space-y-4 text-sm">
              {selectedSchedule.providers.map((p) => (
                <div key={p.id}>
                  <p className="text-gray-500 text-xs mb-0.5">Provider</p>
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.specialty}</p>
                </div>
              ))}
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Service Types</p>
                <p className="text-gray-900">{selectedSchedule.serviceTypes.join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Planning Horizon</p>
                <p className="text-gray-900">
                  {format(parseISO(selectedSchedule.planningHorizon.start), 'MMM d, yyyy')}
                  {' – '}
                  {format(parseISO(selectedSchedule.planningHorizon.end), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Available Slots</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${selectedSchedule.availableSlots > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {selectedSchedule.availableSlots} available
                </span>
              </div>
              <button
                onClick={() => { setSelectedSchedule(null); navigate('/scheduling/new') }}
                className="w-full mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
