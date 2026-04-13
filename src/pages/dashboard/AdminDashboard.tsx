import { format, parseISO, differenceInDays } from 'date-fns'
import {
  Users, AlertTriangle, DollarSign, TrendingUp,
  FileCheck, Activity, ArrowRight, UserX, ShieldAlert,
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useCareGaps } from '../../hooks/useCareGaps'
import { usePatients } from '../../hooks/usePatients'
import { useAppointments } from '../../hooks/useAppointments'
import { StatCard } from '../../components/shared/StatCard'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { patientJourneys } from '../../data/patientJourneys'

// Adherence distribution for bar chart (buckets)
function buildAdherenceChart() {
  const buckets = [
    { range: '0–20%', count: 0 },
    { range: '21–40%', count: 0 },
    { range: '41–60%', count: 0 },
    { range: '61–80%', count: 0 },
    { range: '81–100%', count: 0 },
  ]
  for (const j of patientJourneys) {
    const idx = Math.min(Math.floor(j.adherenceScore / 20), 4)
    buckets[idx].count++
  }
  return buckets
}

// Care gap trend over last 7 days (mock — simulated from gap due dates)
function buildGapTrendChart(gaps: { dueDate: string; status: string }[]) {
  const days: { label: string; overdue: number; upcoming: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en', { weekday: 'short' })
    const dateStr = d.toISOString().split('T')[0]
    const overdue = gaps.filter(
      (g) => g.status === 'overdue' || g.status === 'critical'
    ).filter((g) => g.dueDate <= dateStr).length
    const upcoming = gaps.filter((g) => g.status === 'upcoming').length
    days.push({ label, overdue: Math.max(0, overdue - i), upcoming: Math.max(0, upcoming - Math.floor(i / 2)) })
  }
  return days
}

const riskColors: Record<string, string> = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-green-100 text-green-700',
}

const teamColors: Record<string, string> = {
  pac:    'bg-blue-100 text-blue-700',
  chw:    'bg-teal-100 text-teal-700',
  doctor: 'bg-purple-100 text-purple-700',
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const { data: gaps, isLoading: gapsLoading } = useCareGaps()
  const { data: patients, isLoading: patientsLoading } = usePatients()
  const { data: appointments } = useAppointments()

  if (gapsLoading || patientsLoading) return <PageLoader />

  // Patient metrics
  const totalPatients = (patients ?? []).length
  const highRisk = (patients ?? []).filter((p) => p.riskLevel === 'high').length
  const consentIssues = (patients ?? []).filter((p) => p.consentStatus !== 'active').length
  const activeStage = patientJourneys.filter((j) => j.stage === 'active_care').length
  const maintenanceStage = patientJourneys.filter((j) => j.stage === 'maintenance').length

  // Care gap metrics
  const openGaps = (gaps ?? []).filter((g) => g.status !== 'resolved')
  const criticalGaps = openGaps.filter((g) => g.status === 'critical' || g.status === 'overdue')
  const revenueAtRisk = openGaps.filter((g) => g.revenueOpportunity).reduce((s, g) => s + (g.estimatedRevenue ?? 0), 0)
  const avgAdherence = patientJourneys.length > 0
    ? Math.round(patientJourneys.reduce((s, j) => s + j.adherenceScore, 0) / patientJourneys.length)
    : 0

  // Today's appointments
  const todayStr = new Date().toDateString()
  const todayApts = (appointments ?? []).filter((a) => new Date(a.dateTime).toDateString() === todayStr)
  const missedApts = (appointments ?? []).filter((a) => a.status === 'cancelled' || a.status === 'no_show')

  const adherenceChart = buildAdherenceChart()
  const gapTrendChart = buildGapTrendChart(openGaps)

  // Low adherence patients (bottom 5)
  const lowAdherence = [...patientJourneys]
    .sort((a, b) => a.adherenceScore - b.adherenceScore)
    .slice(0, 5)
    .map((j) => ({
      ...j,
      patient: (patients ?? []).find((p) => p.id === j.patientId),
    }))
    .filter((j) => j.patient)

  return (
    <div className="space-y-6">

      {/* Row 1 — Patient overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={totalPatients} icon={Users} color="blue" />
        <StatCard label="High Risk Patients" value={highRisk} icon={AlertTriangle} color={highRisk > 5 ? 'red' : 'orange'} />
        <StatCard label="Consent Issues" value={consentIssues} icon={FileCheck} color={consentIssues > 0 ? 'amber' : 'green'} />
        <StatCard label="Active in Care" value={activeStage} icon={Activity} color="teal" />
      </div>

      {/* Row 2 — Care gap overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Care Gaps" value={openGaps.length} icon={ShieldAlert} color="indigo" />
        <StatCard label="Critical / Overdue" value={criticalGaps.length} icon={AlertTriangle} color={criticalGaps.length > 5 ? 'red' : 'orange'} />
        <StatCard label="Revenue at Risk" value={`$${revenueAtRisk.toLocaleString()}`} icon={DollarSign} color="emerald" />
        <StatCard label="Avg Adherence" value={`${avgAdherence}%`} icon={TrendingUp} color={avgAdherence >= 75 ? 'purple' : avgAdherence >= 55 ? 'amber' : 'red'} />
      </div>

      {/* Row 3 — Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adherence distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Patient Adherence Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={adherenceChart} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Patients" radius={[4, 4, 0, 0]}
                fill="url(#adherenceGrad)"
              />
              <defs>
                <linearGradient id="adherenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Care gap trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Care Gap Trend — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={gapTrendChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="overdue" name="Overdue" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="upcoming" name="Upcoming" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4 — Two panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Low adherence patients */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Lowest Adherence Patients</h3>
            <button onClick={() => navigate('/patients')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              All patients <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {lowAdherence.map((j) => (
              <div key={j.patientId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {j.patient!.firstName[0]}{j.patient!.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <button
                      onClick={() => navigate(`/patients/${j.patientId}`)}
                      className="text-sm font-medium text-blue-600 hover:underline truncate block"
                    >
                      {j.patient!.firstName} {j.patient!.lastName}
                    </button>
                    <p className="text-xs text-gray-500">{j.nextAction}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${j.adherenceScore < 40 ? 'text-red-600' : j.adherenceScore < 60 ? 'text-orange-600' : 'text-amber-600'}`}>
                      {j.adherenceScore}%
                    </p>
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-0.5">
                      <div
                        className={`h-1.5 rounded-full ${j.adherenceScore < 40 ? 'bg-red-500' : j.adherenceScore < 60 ? 'bg-orange-400' : 'bg-amber-400'}`}
                        style={{ width: `${j.adherenceScore}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColors[j.patient!.riskLevel]}`}>
                    {j.patient!.riskLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top revenue opportunities */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Revenue Opportunities</h3>
            <button onClick={() => navigate('/care-gaps')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              All gaps <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="pb-2 pr-4">Patient</th>
                  <th className="pb-2 pr-4">Activity</th>
                  <th className="pb-2 pr-4">Team</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {criticalGaps
                  .filter((g) => g.revenueOpportunity)
                  .sort((a, b) => (b.estimatedRevenue ?? 0) - (a.estimatedRevenue ?? 0))
                  .slice(0, 6)
                  .map((gap) => (
                    <tr key={gap.id} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-4">
                        <button onClick={() => navigate(`/patients/${gap.patientId}`)} className="text-blue-600 hover:underline font-medium">
                          {gap.patientName}
                        </button>
                      </td>
                      <td className="py-2.5 pr-4 text-gray-700 text-xs">{gap.activityName}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${teamColors[gap.assignedTeam]}`}>
                          {gap.assignedTeam.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-semibold text-emerald-700">
                        ${gap.estimatedRevenue}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Total overdue revenue</span>
            <span className="font-bold text-emerald-700">${revenueAtRisk.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Row 5 — Today's snapshot + consent issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Today's appointments snapshot */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Today's Appointments</h3>
            <button onClick={() => navigate('/scheduling')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Schedule <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">{todayApts.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Scheduled</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{todayApts.filter((a) => a.status === 'completed').length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Completed</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">{missedApts.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Missed</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {todayApts.slice(0, 4).map((apt) => {
              const p = (patients ?? []).find((x) => x.id === apt.patientId)
              return (
                <div key={apt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs">
                  <span className="font-medium text-gray-800">{p ? `${p.firstName} ${p.lastName}` : apt.patientId}</span>
                  <span className="text-gray-500">{format(parseISO(apt.dateTime), 'h:mm a')} · {apt.type.replace(/_/g, ' ')}</span>
                </div>
              )
            })}
            {todayApts.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No appointments today</p>}
          </div>
        </div>

        {/* Consent issues */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Consent Issues</h3>
            <button onClick={() => navigate('/consent')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Manage <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {consentIssues === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400">
              <FileCheck className="h-8 w-8 mb-2 text-green-400" />
              <p className="text-sm">All consents are active</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(patients ?? [])
                .filter((p) => p.consentStatus !== 'active')
                .map((p) => {
                  const journey = patientJourneys.find((j) => j.patientId === p.id)
                  return (
                    <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border ${p.consentStatus === 'missing' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <UserX className={`h-4 w-4 flex-shrink-0 ${p.consentStatus === 'missing' ? 'text-red-500' : 'text-amber-500'}`} />
                        <div className="min-w-0">
                          <button onClick={() => navigate(`/patients/${p.id}`)} className="text-sm font-medium text-blue-600 hover:underline">
                            {p.firstName} {p.lastName}
                          </button>
                          {journey && <p className="text-xs text-gray-500 truncate">{journey.nextAction}</p>}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${p.consentStatus === 'missing' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {p.consentStatus}
                      </span>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}