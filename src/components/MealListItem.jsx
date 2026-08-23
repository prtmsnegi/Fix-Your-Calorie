import { Pencil, Trash2 } from 'lucide-react'
import { useFoods } from '../context/FoodsContext'
import { resolveMealDisplay } from '../utils/nutrition'

export function MealListItem({ meal, onEdit, onDelete }) {
  const { foods } = useFoods()
  const d = resolveMealDisplay(meal, foods)

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
          {d.food_name} <span className="text-gray-400 font-normal">x{meal.quantity} {d.unit}</span>
          {d.isStale && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">deleted food</span>}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {Math.round(d.calories)} cal | {Math.round(d.protein_g)}P {Math.round(d.carbs_g)}C {Math.round(d.fat_g)}F · {meal.timestamp}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <button
          onClick={() => onEdit(meal)}
          className="p-2 text-gray-400 hover:text-emerald-500"
          aria-label="Edit meal"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(meal)}
          className="p-2 text-gray-400 hover:text-red-500"
          aria-label="Delete meal"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
