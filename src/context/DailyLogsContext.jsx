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
    measurements: { waist_cm: null, chest_cm: null, arms_cm: null, hips_cm: null },
    meals: [],
    daily_totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  }
}

export function DailyLogsProvider({ children }) {
  const [dailyLogs, setDailyLogs] = useLocalStorage('calorie-tracker:dailyLogs', {})

  const value = useMemo(() => {
    // Merges over emptyLog() so logs saved before a schema field existed (e.g.
    // measurements) still come back with a sensible default for it.
    const getLogForDate = (dateStr) => ({ ...emptyLog(), ...dailyLogs[dateStr] })

    const updateDay = (dateStr, updater) => {
      setDailyLogs((prev) => {
        const current = prev[dateStr] || emptyLog()
        const updated = updater(current)
        return { ...prev, [dateStr]: updated }
      })
    }

    const addMeal = (dateStr, payload) => {
      const meal = payload.is_quick_entry
        ? {
            id: crypto.randomUUID(),
            meal_type: payload.meal_type,
            food_id: null,
            food_name: payload.food_name,
            unit: 'entry',
            quantity: 1,
            calories: Number(payload.calories) || 0,
            protein_g: Number(payload.protein_g) || 0,
            carbs_g: Number(payload.carbs_g) || 0,
            fat_g: Number(payload.fat_g) || 0,
            is_quick_entry: true,
            timestamp: formatTime(new Date()),
          }
        : {
            id: crypto.randomUUID(),
            meal_type: payload.meal_type,
            food_id: payload.food.id,
            food_name: payload.food.name,
            unit: payload.food.nutrition_per_unit.unit,
            quantity: Number(payload.quantity) || 0,
            ...computeMealNutrition(payload.quantity, payload.food.nutrition_per_unit),
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

    // partial holds only the fields the user actually entered, merged over
    // whatever was already logged for that day (and over the schema default,
    // in case the day predates the measurements field).
    const setMeasurements = (dateStr, partial) => {
      updateDay(dateStr, (log) => ({
        ...log,
        measurements: { ...emptyLog().measurements, ...log.measurements, ...partial },
      }))
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

    return { dailyLogs, getLogForDate, addMeal, updateMeal, deleteMeal, setWeight, setMeasurements, clearDay, isDateWithin7Days, replaceDailyLogs }
  }, [dailyLogs, setDailyLogs])

  return <DailyLogsContext.Provider value={value}>{children}</DailyLogsContext.Provider>
}

export function useDailyLogs() {
  const ctx = useContext(DailyLogsContext)
  if (!ctx) throw new Error('useDailyLogs must be used within DailyLogsProvider')
  return ctx
}
