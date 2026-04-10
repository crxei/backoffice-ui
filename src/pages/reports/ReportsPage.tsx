import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download } from 'lucide-react'
import { PageHeader } from '../../components/shared/PageHeader'
import { toast } from '../../components/shared/Toast'

const appointmentData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  scheduled: Math.floor(8 + Math.random() * 6),
  completed: Math.floor(5 + Math.random() * 5),
  no_show: Math.floor(Math.random() * 3),
}))

const notificationData = [
  { channel: 'SMS', deliveryRate: 94, sent: 312 },
  { channel: 'Email', deliveryRate: 87, sent: 198 },
  { channel: 'Push', deliveryRate: 76, sent: 145 },
  { channel: 'Voice', deliveryRate: 62, sent: 88 },
]

const carePlanData = [
  { name: 'Active', value: 8, color: '#22c55e' },
  { name: 'Completed', value: 3, color: '#14b8a6' },
  { name: 'Pending', value: 3, color: '#f97316' },
  { name: 'Archived', value: 1, color: '#94a3b8' },
]

const chwData = [
  { week: 'Week 1', DeShawn: 4, Kira: 5, Priscilla: 3, Marcus: 4 },
  { week: 'Week 2', DeShawn: 5, Kira: 4, Priscilla: 5, Marcus: 3 },
  { week: 'Week 3', DeShawn: 3, Kira: 6, Priscilla: 4, Marcus: 5 },
  { week: 'Week 4', DeShawn: 5, Kira: 5, Priscilla: 5, Marcus: 4 },
]

const ranges = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days']

export function ReportsPage() {
  const [range, setRange] = useState('Last 30 Days')

  const handleExport = () => {
    toast('info', 'Export coming soon', 'Export feature is not yet available in this prototype')
  }

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Operational insights and performance metrics"
        actions={
          <select value={range} onChange={(e) => setRange(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            {ranges.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Utilization */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Appointment Utilization</h3>
            <button onClick={handleExport} className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50">
              <Download className="h-3 w-3" /> Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={appointmentData.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} label={{ value: 'Day', position: 'insideBottom', offset: -2 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="scheduled" stroke="#3b82f6" strokeWidth={2} dot={false} name="Scheduled" />
              <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={false} name="Completed" />
              <Line type="monotone" dataKey="no_show" stroke="#ef4444" strokeWidth={2} dot={false} name="No Show" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Notification Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Notification Delivery Rate by Channel</h3>
            <button onClick={handleExport} className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50">
              <Download className="h-3 w-3" /> Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={notificationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="deliveryRate" name="Delivery Rate %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Care Plan Outcomes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Care Plan Outcomes</h3>
            <button onClick={handleExport} className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50">
              <Download className="h-3 w-3" /> Export
            </button>
          </div>
          <div className="flex items-center justify-center gap-8">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={carePlanData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {carePlanData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {carePlanData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-sm text-gray-700">{d.name}</span>
                  <span className="text-sm font-semibold text-gray-900 ml-1">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHW Visit Completion */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">CHW Visit Completions by Week</h3>
            <button onClick={handleExport} className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50">
              <Download className="h-3 w-3" /> Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chwData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="DeShawn" fill="#3b82f6" radius={[2,2,0,0]} />
              <Bar dataKey="Kira" fill="#10b981" radius={[2,2,0,0]} />
              <Bar dataKey="Priscilla" fill="#f59e0b" radius={[2,2,0,0]} />
              <Bar dataKey="Marcus" fill="#8b5cf6" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
