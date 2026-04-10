interface StatusBadgeProps {
  status: string
  className?: string
}

const statusStyles: Record<string, string> = {
  // Green
  active: 'bg-green-100 text-green-800',
  confirmed: 'bg-green-100 text-green-800',
  approved: 'bg-green-100 text-green-800',
  delivered: 'bg-green-100 text-green-800',
  success: 'bg-green-100 text-green-800',
  paid: 'bg-green-100 text-green-800',
  accepted: 'bg-green-100 text-green-800',
  achieved: 'bg-green-100 text-green-800',
  // Blue
  scheduled: 'bg-blue-100 text-blue-800',
  pending: 'bg-blue-100 text-blue-800',
  sent: 'bg-blue-100 text-blue-800',
  routine: 'bg-blue-100 text-blue-800',
  // Yellow
  in_progress: 'bg-yellow-100 text-yellow-800',
  running: 'bg-yellow-100 text-yellow-800',
  not_started: 'bg-yellow-100 text-yellow-800',
  // Teal
  completed: 'bg-teal-100 text-teal-800',
  // Orange
  pending_approval: 'bg-orange-100 text-orange-800',
  retrying: 'bg-orange-100 text-orange-800',
  appealing: 'bg-orange-100 text-orange-800',
  urgent: 'bg-orange-100 text-orange-800',
  // Purple
  draft: 'bg-purple-100 text-purple-800',
  // Gray
  cancelled: 'bg-gray-100 text-gray-700',
  archived: 'bg-gray-100 text-gray-700',
  revoked: 'bg-gray-100 text-gray-700',
  // Red
  failed: 'bg-red-100 text-red-800',
  denied: 'bg-red-100 text-red-800',
  expired: 'bg-red-100 text-red-800',
  missing: 'bg-red-100 text-red-800',
  no_show: 'bg-red-100 text-red-800',
  overdue: 'bg-red-100 text-red-800',
  escalated: 'bg-red-100 text-red-800',
  emergent: 'bg-red-100 text-red-800',
  'in-network': 'bg-green-100 text-green-800',
  'out-of-network': 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  in_progress: 'In Progress',
  pending_approval: 'Pending Approval',
  not_started: 'Not Started',
  no_show: 'No Show',
  'in-network': 'In Network',
  'out-of-network': 'Out of Network',
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = statusStyles[status] ?? 'bg-gray-100 text-gray-700'
  const label = statusLabels[status] ?? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style} ${className}`}
    >
      {label}
    </span>
  )
}
