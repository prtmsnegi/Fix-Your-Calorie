import { Pencil, Trash2 } from 'lucide-react'

export function FoodListItem({ food, onEdit, onDelete }) {
  const n = food.nutrition_per_unit
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
          {food.name} <span className="text-gray-400 font-normal">(1 {n.unit})</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {Math.round(n.calories)} cal | {Math.round(n.protein_g)}P {Math.round(n.carbs_g)}C {Math.round(n.fat_g)}F
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <button
          onClick={() => onEdit(food)}
          className="p-2 text-gray-400 hover:text-emerald-500"
          aria-label={`Edit ${food.name}`}
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(food)}
          className="p-2 text-gray-400 hover:text-red-500"
          aria-label={`Delete ${food.name}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
