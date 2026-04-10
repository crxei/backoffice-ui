import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

export type CardColor =
  | 'blue' | 'teal' | 'indigo' | 'green'
  | 'amber' | 'red' | 'purple' | 'emerald'
  | 'orange' | 'cyan'

interface StatCardProps {
  label: string
  value: string | number
  trend?: { value: number; direction: 'up' | 'down'; label: string }
  variant?: 'default' | 'warning' | 'danger' | 'success'
  color?: CardColor
  icon?: LucideIcon
  onClick?: () => void
}

const colorStyles: Record<CardColor, { border: string; iconBg: string }> = {
  blue:    { border: 'border-t-blue-500',    iconBg: 'bg-blue-500' },
  teal:    { border: 'border-t-teal-500',    iconBg: 'bg-teal-500' },
  indigo:  { border: 'border-t-indigo-500',  iconBg: 'bg-indigo-500' },
  green:   { border: 'border-t-green-500',   iconBg: 'bg-green-500' },
  amber:   { border: 'border-t-amber-400',   iconBg: 'bg-amber-400' },
  red:     { border: 'border-t-red-500',     iconBg: 'bg-red-500' },
  purple:  { border: 'border-t-purple-500',  iconBg: 'bg-purple-500' },
  emerald: { border: 'border-t-emerald-500', iconBg: 'bg-emerald-500' },
  orange:  { border: 'border-t-orange-500',  iconBg: 'bg-orange-500' },
  cyan:    { border: 'border-t-cyan-500',    iconBg: 'bg-cyan-500' },
}

const variantToColor: Record<string, CardColor> = {
  default: 'blue',
  success: 'green',
  warning: 'amber',
  danger:  'red',
}

export function StatCard({ label, value, trend, variant = 'default', color, icon: Icon, onClick }: StatCardProps) {
  const resolvedColor = color ?? variantToColor[variant]
  const { border, iconBg } = colorStyles[resolvedColor]

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 border-t-4 ${border} p-5 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.direction === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value}%
              </span>
              <span className="text-xs text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`rounded-lg p-2.5 ${iconBg}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
    </div>
  )
}
