import { useMemo, useState } from 'react'
import { Plus, Trash2, Utensils } from 'lucide-react'
import { useFoods } from '../context/FoodsContext'
import { useDailyLogs } from '../context/DailyLogsContext'
import { useProfile } from '../context/ProfileContext'
import { computeDailyTotals, computeMacroPercents } from '../utils/nutrition'
import { todayStr, formatDisplayDate } from '../utils/dateUtils'
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '../constants/mealTypes'
import { ProgressBar } from '../components/ProgressBar'
import { MacroRow } from '../components/MacroRow'
import { MealListItem } from '../components/MealListItem'
import { EmptyState } from '../components/EmptyState'
import { InfoLabel } from '../components/InfoLabel'
import { AddMealModal } from './AddMealModal'

export function HomeScreen() {
  const { foods } = useFoods()
  const { getLogForDate, deleteMeal, clearDay } = useDailyLogs()
  const { profile } = useProfile()

  const dateStr = todayStr()
  const log = getLogForDate(dateStr)

  const [addMealFor, setAddMealFor] = useState(null) // null | mealType string
  const [editingMeal, setEditingMeal] = useState(null)

  const totals = useMemo(() => computeDailyTotals(log.meals, foods), [log.meals, foods])
  const macroPct = useMemo(() => computeMacroPercents(totals), [totals])

  const goalCalories = profile.goal_calories || 2000
  const remaining = goalCalories - totals.calories
  const pctConsumed = goalCalories > 0 ? Math.round((totals.calories / goalCalories) * 100) : 0

  const goalGrams = useMemo(() => {
    const proteinCals = goalCalories * ((profile.goal_protein_pct || 0) / 100)
    const carbsCals = goalCalories * ((profile.goal_carbs_pct || 0) / 100)
    const fatCals = goalCalories * ((profile.goal_fat_pct || 0) / 100)
    return { protein_g: proteinCals / 4, carbs_g: carbsCals / 4, fat_g: fatCals / 9 }
  }, [goalCalories, profile])

  const mealsByType = useMemo(() => {
    return MEAL_TYPES.reduce((acc, mt) => {
      acc[mt] = log.meals.filter((m) => m.meal_type === mt)
      return acc
    }, {})
  }, [log.meals])

  const caloriesByType = useMemo(() => {
    return MEAL_TYPES.reduce((acc, mt) => {
      acc[mt] = computeDailyTotals(mealsByType[mt], foods).calories
      return acc
    }, {})
  }, [mealsByType, foods])

  const handleDeleteMeal = (meal) => {
    if (confirm('Delete this meal from today’s log?')) deleteMeal(dateStr, meal.id)
  }

  const handleClearDay = () => {
    if (log.meals.length === 0) return
    if (confirm('Clear all meals logged today? This cannot be undone.')) clearDay(dateStr)
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">{formatDisplayDate(dateStr)}</h1>
        <button
          onClick={handleClearDay}
          className="p-2 text-gray-400 hover:text-red-500"
          aria-label="Clear day"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">Calories</span>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {Math.round(totals.calories)} / {goalCalories}
          </span>
        </div>
        <ProgressBar
          value={totals.calories}
          max={goalCalories}
          colorClass={totals.calories > goalCalories ? 'bg-red-500' : 'bg-emerald-500'}
        />
        <p className="text-xs text-gray-400 mt-1">{pctConsumed}%</p>

        <p className={`text-sm font-semibold mt-2 ${remaining < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {remaining >= 0 ? `${Math.round(remaining)} cal remaining` : `${Math.round(-remaining)} cal over budget`}
        </p>

        <div className="mt-4">
          <InfoLabel label="Macros" className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Protein % = (protein g × 4) ÷ total cal × 100. Carbs % = (carbs g × 4) ÷ total cal × 100.
            Fat % = (fat g × 9) ÷ total cal × 100 (4 cal/g for protein and carbs, 9 cal/g for fat).
            Today: {Math.round(macroPct.protein_pct)}% / {Math.round(macroPct.carbs_pct)}% / {Math.round(macroPct.fat_pct)}%.
          </InfoLabel>
          <div className="space-y-2 mt-1">
            <MacroRow label="Protein" grams={totals.protein_g} percent={macroPct.protein_pct} colorClass="bg-sky-500" />
            <MacroRow label="Carbs" grams={totals.carbs_g} percent={macroPct.carbs_pct} colorClass="bg-amber-500" />
            <MacroRow label="Fat" grams={totals.fat_g} percent={macroPct.fat_pct} colorClass="bg-violet-500" />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Goal: {Math.round(goalGrams.protein_g)}P / {Math.round(goalGrams.carbs_g)}C / {Math.round(goalGrams.fat_g)}F g
        </p>
      </div>

      {MEAL_TYPES.map((mt) => (
        <div key={mt} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{MEAL_TYPE_LABELS[mt]}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{Math.round(caloriesByType[mt])} cal</span>
              <button
                onClick={() => setAddMealFor(mt)}
                className="p-1 text-emerald-500"
                aria-label={`Add to ${MEAL_TYPE_LABELS[mt]}`}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          {mealsByType[mt].length === 0 ? (
            <p className="text-xs text-gray-400 py-1">No meals logged</p>
          ) : (
            mealsByType[mt].map((meal) => (
              <MealListItem
                key={meal.id}
                meal={meal}
                onEdit={setEditingMeal}
                onDelete={handleDeleteMeal}
              />
            ))
          )}
        </div>
      ))}

      {log.meals.length === 0 && (
        <EmptyState icon={Utensils} title="No meals logged today" subtitle="Tap + Add Meal to get started" />
      )}

      <button
        onClick={() => setAddMealFor('breakfast')}
        className="w-full mt-2 btn-primary flex items-center justify-center gap-2"
      >
        <Plus size={18} /> Add Meal
      </button>

      {addMealFor && (
        <AddMealModal dateStr={dateStr} defaultMealType={addMealFor} onClose={() => setAddMealFor(null)} />
      )}
      {editingMeal && (
        <AddMealModal
          dateStr={dateStr}
          editingMeal={editingMeal}
          onClose={() => setEditingMeal(null)}
        />
      )}
    </div>
  )
}
