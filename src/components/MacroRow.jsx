import { ProgressBar } from './ProgressBar'

export function MacroRow({ label, grams, percent, colorClass }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-sm text-gray-600 dark:text-gray-300">{label}</span>
      <div className="flex-1">
        <ProgressBar value={percent} max={100} colorClass={colorClass} size="sm" />
      </div>
      <span className="w-24 text-right text-sm font-medium text-gray-800 dark:text-gray-100">
        {Math.round(grams)}g ({Math.round(percent)}%)
      </span>
    </div>
  )
}
