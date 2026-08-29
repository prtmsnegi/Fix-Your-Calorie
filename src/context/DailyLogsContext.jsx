import { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { computeMealNutrition } from '../utils/nutrition'
import { formatTime, todayStr, daysBetween } from '../utils/dateUtils'

const DailyLogsContext = createContext(null)

// daily_totals is kept in the schema for compatibility but is never read as the
// source of truth — totals are always recomputed live via computeDailyTotals()
// so that food edits propagate to past logs (see utils/nutrition.js).
function emptyLog() {
  return {
    weight_kg: null,
    meals: [],
    daily_totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  }
}

export function DailyLogsProvider({ children }) {
  const [dailyLogs, setDailyLogs] = useLocalStorage('calorie-tracker:dailyLogs', {})

  const value = useMemo(() => {
    const getLogForDate = (dateStr) => dailyLogs[dateStr] || emptyLog()

    const updateDay = (dateStr, updater) => {
      setDailyLogs((prev) => {
        const current = prev[dateStr] || emptyLog()
        const updated = updater(current)
        return { ...prev, [dateStr]: updated }
      })
    }

    const addMeal = (dateStr, { meal_type, food, quantity }) => {
      const nutrition = computeMealNutrition(quantity, food.nutrition_per_unit)
      const meal = {
        id: crypto.randomUUID(),
        meal_type,
        food_id: food.id,
        food_name: food.name,
        unit: food.nutrition_per_unit.unit,
        quantity: Number(quantity) || 0,
        ...nutrition,
        timestamp: formatTime(new Date()),
      }
      updateDay(dateStr, (log) => ({ ...log, meals: [...log.meals, meal] }))
      return meal
    }

    const updateMeal = (dateStr, mealId, partial) => {
      updateDay(dateStr, (log) => ({
        ...log,
        meals: log.meals.map((m) => (m.id === mealId ? { ...m, ...partial } : m)),
      }))
    }

    const deleteMeal = (dateStr, mealId) => {
      updateDay(dateStr, (log) => ({
        ...log,
        meals: log.meals.filter((m) => m.id !== mealId),
      }))
    }

    const setWeight = (dateStr, weightKg) => {
      updateDay(dateStr, (log) => ({ ...log, weight_kg: weightKg }))
    }

    const clearDay = (dateStr) => {
      updateDay(dateStr, (log) => ({ ...log, meals: [] }))
    }

    const isDateWithin7Days = (dateStr) => {
      const today = todayStr()
      const daysDiff = daysBetween(dateStr, today)
      return daysDiff >= 0 && daysDiff <= 7
    }

    const replaceDailyLogs = (newLogs) => setDailyLogs(newLogs)

    return { dailyLogs, getLogForDate, addMeal, updateMeal, deleteMeal, setWeight, clearDay, isDateWithin7Days, replaceDailyLogs }
  }, [dailyLogs, setDailyLogs])

  return <DailyLogsContext.Provider value={value}>{children}</DailyLogsContext.Provider>
}

export function useDailyLogs() {
  const ctx = useContext(DailyLogsContext)
  if (!ctx) throw new Error('useDailyLogs must be used within DailyLogsProvider')
  return ctx
}
