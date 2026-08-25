import { useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'

export function Toast({ message, onDismiss, duration = 3000 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onDismiss])

  if (!message) return null

  return (
    <div className="fixed top-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="max-w-md w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg px-4 py-2.5 flex items-center gap-2 pointer-events-auto">
        <CheckCircle2 size={16} className="shrink-0 text-emerald-400 dark:text-emerald-600" />
        <span>{message}</span>
      </div>
    </div>
  )
}
