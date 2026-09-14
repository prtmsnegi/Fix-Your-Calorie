import { todayStr, addDays } from './dateUtils'

export function computeMealNutrition(quantity, nutritionPerUnit) {
  const qty = Number(quantity) || 0
  return {
    calories: qty * (nutritionPerUnit?.calories || 0),
    protein_g: qty * (nutritionPerUnit?.protein_g || 0),
    carbs_g: qty * (nutritionPerUnit?.carbs_g || 0),
    fat_g: qty * (nutritionPerUnit?.fat_g || 0),
  }
}

// Resolves a logged meal's display nutrition against the *current* foods database
// so edits to a food propagate to every past log automatically. Falls back to the
// frozen snapshot captured at log time if the food was since deleted. Quick entries
// (no food_id) have no database record to resolve against, so their values are
// always the frozen ones entered at log time.
export function resolveMealDisplay(meal, foods) {
  if (meal.is_quick_entry) {
    return {
      food_name: meal.food_name,
      unit: meal.unit,
      calories: meal.calories,
      protein_g: meal.protein_g,
      carbs_g: meal.carbs_g,
      fat_g: meal.fat_g,
      isStale: false,
    }
  }
  const food = foods.find((f) => f.id === meal.food_id)
  if (food) {
    return {
      food_name: food.name,
      unit: food.nutrition_per_unit.unit,
      ...computeMealNutrition(meal.quantity, food.nutrition_per_unit),
      isStale: false,
    }
  }
  return {
    food_name: meal.food_name,
    unit: meal.unit,
    calories: meal.calories,
    protein_g: meal.protein_g,
    carbs_g: meal.carbs_g,
    fat_g: meal.fat_g,
    isStale: true,
  }
}

export function computeDailyTotals(meals, foods) {
  return meals.reduce(
    (acc, meal) => {
      const d = resolveMealDisplay(meal, foods)
      acc.calories += d.calories
      acc.protein_g += d.protein_g
      acc.carbs_g += d.carbs_g
      acc.fat_g += d.fat_g
      return acc
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  )
}

// Dense daily calorie series (one entry per calendar day, zero-filled for days
// with no meals) for the trailing `days` days ending today. Unlike sparse weight
// entries, calorie trends need every day present for a continuous line/average.
export function getDailyCalorieSeries(dailyLogs, foods, days) {
  const today = todayStr()
  const series = []
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i)
    const log = dailyLogs[date]
    const calories = log ? computeDailyTotals(log.meals, foods).calories : 0
    series.push({ date, calories })
  }
  return series
}

export function computeMacroPercents({ protein_g, carbs_g, fat_g }) {
  const totalCals = protein_g * 4 + carbs_g * 4 + fat_g * 9
  if (totalCals <= 0) return { protein_pct: 0, carbs_pct: 0, fat_pct: 0 }
  return {
    protein_pct: ((protein_g * 4) / totalCals) * 100,
    carbs_pct: ((carbs_g * 4) / totalCals) * 100,
    fat_pct: ((fat_g * 9) / totalCals) * 100,
  }
}
