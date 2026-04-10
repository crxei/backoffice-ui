import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react'
import { useState } from 'react'

interface AlertBannerProps {
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  description?: string
  dismissible?: boolean
}

const styles = {
  info: { container: 'bg-blue-50 border-blue-200', icon: Info, iconColor: 'text-blue-500', textColor: 'text-blue-800' },
  warning: { container: 'bg-amber-50 border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500', textColor: 'text-amber-800' },
  success: { container: 'bg-green-50 border-green-200', icon: CheckCircle, iconColor: 'text-green-500', textColor: 'text-green-800' },
  error: { container: 'bg-red-50 border-red-200', icon: XCircle, iconColor: 'text-red-500', textColor: 'text-red-800' },
}

export function AlertBanner({ type, title, description, dismissible = false }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const { container, icon: Icon, iconColor, textColor } = styles[type]

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${container} mb-4`}>
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${textColor}`}>{title}</p>
        {description && <p className={`mt-0.5 text-sm ${textColor} opacity-80`}>{description}</p>}
      </div>
      {dismissible && (
        <button onClick={() => setDismissed(true)} className={`${textColor} opacity-60 hover:opacity-100`}>
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
