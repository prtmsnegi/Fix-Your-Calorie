import { formatDisplayDate } from '../utils/dateUtils'
import { TrendArrow } from './TrendArrow'

export function WeightEntryRow({ date, weight_kg, direction, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0 text-left"
    >
      <span className="text-sm text-gray-600 dark:text-gray-300">{formatDisplayDate(date)}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{weight_kg} kg</span>
        <TrendArrow direction={direction} />
      </div>
    </button>
  )
}
