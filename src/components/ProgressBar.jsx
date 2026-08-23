export function ProgressBar({ value, max, colorClass = 'bg-emerald-500', size = 'md' }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const heightClass = size === 'sm' ? 'h-2' : 'h-3'
  return (
    <div className={`w-full ${heightClass} rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
