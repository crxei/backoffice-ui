import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { RefreshCw, Settings, Smartphone, Mail, Bell, MessageSquare, Phone } from 'lucide-react'
import { useState } from 'react'
import { useNotifications, useRetryNotification } from '../../hooks/useNotifications'
import { usePatients } from '../../hooks/usePatients'
import { PageHeader } from '../../components/shared/PageHeader'
import { DataTable, type Column } from '../../components/shared/DataTable'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { StatCard } from '../../components/shared/StatCard'
import { PageLoader } from '../../components/shared/LoadingSpinner'
import { toast } from '../../components/shared/Toast'
import { type Notification } from '../../data/notifications'

const channelIcons: Record<string, React.ReactNode> = {
  sms: <Smartphone className="h-4 w-4 text-green-600" />,
  email: <Mail className="h-4 w-4 text-blue-600" />,
  push: <Bell className="h-4 w-4 text-purple-600" />,
  teams: <MessageSquare className="h-4 w-4 text-indigo-600" />,
  voice_call: <Phone className="h-4 w-4 text-orange-600" />,
}

export function RemindersPage() {
  const navigate = useNavigate()
  const { data: notifications, isLoading } = useNotifications()
  const { data: patients } = usePatients()
  const retryMutation = useRetryNotification()
  const [activeTab, setActiveTab] = useState<'queue' | 'sent' | 'all'>('queue')

  if (isLoading) return <PageLoader />

  const getPatientName = (id: string) => {
    const p = (patients ?? []).find((x) => x.id === id)
    return p ? `${p.firstName} ${p.lastName}` : id
  }

  const queue = (notifications ?? []).filter((n) => n.status === 'pending' || n.status === 'failed')
  const sent = (notifications ?? []).filter((n) => n.status === 'sent' || n.status === 'delivered' || n.status === 'acknowledged')
  const failed = (notifications ?? []).filter((n) => n.status === 'failed')

  const display = activeTab === 'queue' ? queue : activeTab === 'sent' ? sent : (notifications ?? [])

  const handleRetry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await retryMutation.mutateAsync(id)
      toast('success', 'Notification queued', 'Retry dispatched')
    } catch { toast('error', 'Retry failed') }
  }

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'patient', header: 'Patient', render: (r) => <span className="font-medium">{getPatientName((r as unknown as Notification).patientId)}</span> },
    { key: 'type', header: 'Type', render: (r) => <span className="text-xs capitalize">{(r as unknown as Notification).type.replace(/_/g, ' ')}</span> },
    { key: 'channel', header: 'Channel', render: (r) => (
      <div className="flex items-center gap-1">
        {channelIcons[(r as unknown as Notification).channel]}
        <span className="text-xs uppercase">{(r as unknown as Notification).channel}</span>
      </div>
    )},
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={(r as unknown as Notification).status} /> },
    { key: 'scheduledAt', header: 'Scheduled', sortable: true, render: (r) => format(parseISO((r as unknown as Notification).scheduledAt), 'MMM d, HH:mm') },
    { key: 'sentAt', header: 'Sent', render: (r) => {
      const sa = (r as unknown as Notification).sentAt
      return sa ? format(parseISO(sa), 'MMM d, HH:mm') : '—'
    }},
    { key: 'retryCount', header: 'Retries', render: (r) => <span>{(r as unknown as Notification).retryCount}</span> },
    { key: 'actions', header: '', render: (r) => {
      const n = r as unknown as Notification
      return n.status === 'failed' ? (
        <button onClick={(e) => handleRetry(n.id, e)} className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50">
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      ) : null
    }},
  ]

  return (
    <div>
      <PageHeader
        title="Reminders & Notifications"
        actions={
          <button onClick={() => navigate('/reminders/rules')} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50">
            <Settings className="h-4 w-4" /> Configure Rules
          </button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Delivered" value={sent.filter((n) => n.status === 'delivered').length} variant="success" />
        <StatCard label="Pending" value={queue.filter((n) => n.status === 'pending').length} variant="default" />
        <StatCard label="Failed" value={failed.length} variant={failed.length > 0 ? 'danger' : 'default'} />
        <StatCard label="Acknowledged" value={(notifications ?? []).filter((n) => n.status === 'acknowledged').length} variant="default" />
      </div>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4">
          {([['queue', `Queue (${queue.length})`], ['sent', 'Sent'], ['all', 'All']] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={display.map((n) => ({ ...n } as unknown as Record<string, unknown>))}
        searchable
        searchPlaceholder="Search notifications..."
      />
    </div>
  )
}
