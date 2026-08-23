import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Modal } from '../components/Modal'
import { useFoods } from '../context/FoodsContext'
import { useDailyLogs } from '../context/DailyLogsContext'
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '../constants/mealTypes'
import { computeMealNutrition } from '../utils/nutrition'
import { AddEditFoodModal } from './AddEditFoodModal'

// A minimal food-shaped object so quantity math keeps working when editing a
// meal whose original food was since deleted (falls back to the frozen snapshot).
function foodFromMealSnapshot(meal) {
  return {
    id: meal.food_id,
    name: meal.food_name,
    nutrition_per_unit: {
      unit: meal.unit,
      calories: meal.quantity ? meal.calories / meal.quantity : 0,
      protein_g: meal.quantity ? meal.protein_g / meal.quantity : 0,
      carbs_g: meal.quantity ? meal.carbs_g / meal.quantity : 0,
      fat_g: meal.quantity ? meal.fat_g / meal.quantity : 0,
    },
  }
}

function getRecentFoodIds(dailyLogs, limit = 5) {
  const seen = new Set()
  const ordered = []
  Object.keys(dailyLogs)
    .sort((a, b) => (a < b ? 1 : -1))
    .forEach((date) => {
      ;[...dailyLogs[date].meals].reverse().forEach((m) => {
        if (!seen.has(m.food_id)) {
          seen.add(m.food_id)
          ordered.push(m.food_id)
        }
      })
    })
  return ordered.slice(0, limit)
}

export function AddMealModal({ dateStr, defaultMealType = 'breakfast', editingMeal = null, onClose }) {
  const { foods, addFood, searchFoods } = useFoods()
  const { dailyLogs, addMeal, updateMeal } = useDailyLogs()

  const [mealType, setMealType] = useState(editingMeal?.meal_type || defaultMealType)
  const [query, setQuery] = useState('')
  const [selectedFood, setSelectedFood] = useState(() => {
    if (!editingMeal) return null
    return foods.find((f) => f.id === editingMeal.food_id) || foodFromMealSnapshot(editingMeal)
  })
  const [quantity, setQuantity] = useState(editingMeal?.quantity ?? 1)
  const [showAddFood, setShowAddFood] = useState(false)

  const handleNewFoodSaved = (data) => {
    const newFood = addFood(data)
    setSelectedFood(newFood)
    setShowAddFood(false)
  }

  const recentFoodIds = useMemo(() => getRecentFoodIds(dailyLogs), [dailyLogs])

  const recentFoods = useMemo(() => {
    return recentFoodIds.map((id) => foods.find((f) => f.id === id)).filter(Boolean)
  }, [recentFoodIds, foods])

  const { recentMatches, otherMatches } = useMemo(() => {
    if (!query.trim()) return { recentMatches: [], otherMatches: [] }
    const matches = searchFoods(query)
    const recentSet = new Set(recentFoodIds)
    return {
      recentMatches: matches
        .filter((f) => recentSet.has(f.id))
        .sort((a, b) => recentFoodIds.indexOf(a.id) - recentFoodIds.indexOf(b.id)),
      otherMatches: matches.filter((f) => !recentSet.has(f.id)),
    }
  }, [query, foods, recentFoodIds])

  const nutrition = selectedFood ? computeMealNutrition(quantity, selectedFood.nutrition_per_unit) : null

  const handleAdd = () => {
    if (!selectedFood || !quantity || Number(quantity) <= 0) return
    if (editingMeal) {
      const nutritionNow = computeMealNutrition(quantity, selectedFood.nutrition_per_unit)
      updateMeal(dateStr, editingMeal.id, {
        meal_type: mealType,
        food_id: selectedFood.id,
        food_name: selectedFood.name,
        unit: selectedFood.nutrition_per_unit.unit,
        quantity: Number(quantity) || 0,
        ...nutritionNow,
      })
    } else {
      addMeal(dateStr, { meal_type: mealType, food: selectedFood, quantity })
    }
    onClose()
  }

  return (
    <>
      <Modal title={editingMeal ? 'Edit Meal' : 'Add Meal'} onClose={onClose}>
      <div className="space-y-3">
        <label className="block">
          <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Meal Type</span>
          <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="input">
            {MEAL_TYPES.map((mt) => (
              <option key={mt} value={mt}>{MEAL_TYPE_LABELS[mt]}</option>
            ))}
          </select>
        </label>

        {!selectedFood && (
          <>
            <label className="block">
              <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Select Food</span>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search or select"
                  className="input pl-9"
                />
              </div>
            </label>

            {query.trim() ? (
              <>
                {recentMatches.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Recent Matches</p>
                    <FoodPickList foods={recentMatches} onPick={setSelectedFood} />
                  </div>
                )}
                <FoodPickList
                  foods={otherMatches}
                  onPick={setSelectedFood}
                  emptyText={recentMatches.length === 0 ? 'No matches' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowAddFood(true)}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 py-1"
                >
                  + Add "{query.trim()}" as a new food
                </button>
              </>
            ) : (
              <>
                {recentFoods.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Recent Foods</p>
                    <FoodPickList foods={recentFoods} onPick={setSelectedFood} />
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">All Foods</p>
                  <FoodPickList foods={foods} onPick={setSelectedFood} emptyText="No foods in your database yet — add some in the Foods tab" />
                </div>
              </>
            )}
          </>
        )}

        {selectedFood && (
          <div className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedFood.name}</p>
              <button
                onClick={() => setSelectedFood(null)}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-medium"
              >
                Change
              </button>
            </div>

            <label className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">Quantity</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input w-24"
              />
              <span className="text-sm text-gray-500">{selectedFood.nutrition_per_unit.unit}(s)</span>
            </label>

            {nutrition && (
              <div className="text-sm text-gray-700 dark:text-gray-200">
                <p className="font-semibold">{Math.round(nutrition.calories)} cal</p>
                <p className="text-xs text-gray-500">
                  Protein: {Math.round(nutrition.protein_g)}g, Carbs: {Math.round(nutrition.carbs_g)}g, Fat: {Math.round(nutrition.fat_g)}g
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleAdd}
            disabled={!selectedFood || !quantity || Number(quantity) <= 0}
            className="btn-primary flex-1 disabled:opacity-40"
          >
            {editingMeal ? 'Save Changes' : 'Add to Log'}
          </button>
        </div>
      </div>
      </Modal>
      {showAddFood && (
        <AddEditFoodModal food={null} onSave={handleNewFoodSaved} onClose={() => setShowAddFood(false)} />
      )}
    </>
  )
}

function FoodPickList({ foods, onPick, emptyText }) {
  if (foods.length === 0) {
    return emptyText ? <p className="text-xs text-gray-400 py-2">{emptyText}</p> : null
  }
  return (
    <div className="max-h-48 overflow-y-auto -mx-1">
      {foods.map((f) => (
        <button
          key={f.id}
          onClick={() => onPick(f)}
          className="w-full text-left px-1 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
        >
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {f.name} <span className="text-gray-400">(1 {f.nutrition_per_unit.unit})</span>
          </span>
          <span className="text-xs text-gray-400">{Math.round(f.nutrition_per_unit.calories)} cal</span>
        </button>
      ))}
    </div>
  )
}
