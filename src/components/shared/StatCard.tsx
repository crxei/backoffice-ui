import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  trend?: { value: number; direction: 'up' | 'down'; label: string }
  variant?: 'default' | 'warning' | 'danger' | 'success'
  icon?: LucideIcon
  onClick?: () => void
}

const variantStyles = {
  default: 'border-gray-200',
  warning: 'border-amber-300 bg-amber-50',
  danger: 'border-red-300 bg-red-50',
  success: 'border-green-300 bg-green-50',
}

const valueStyles = {
  default: 'text-gray-900',
  warning: 'text-amber-700',
  danger: 'text-red-700',
  success: 'text-green-700',
}

export function StatCard({ label, value, trend, variant = 'default', icon: Icon, onClick }: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border p-6 ${variantStyles[variant]} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${valueStyles[variant]}`}>{value}</p>
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
          <div className="rounded-lg bg-blue-50 p-2">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        )}
      </div>
    </div>
  )
}
