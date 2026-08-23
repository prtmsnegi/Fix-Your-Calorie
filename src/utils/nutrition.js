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
// frozen snapshot captured at log time if the food was since deleted.
export function resolveMealDisplay(meal, foods) {
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

export function computeMacroPercents({ protein_g, carbs_g, fat_g }) {
  const totalCals = protein_g * 4 + carbs_g * 4 + fat_g * 9
  if (totalCals <= 0) return { protein_pct: 0, carbs_pct: 0, fat_pct: 0 }
  return {
    protein_pct: ((protein_g * 4) / totalCals) * 100,
    carbs_pct: ((carbs_g * 4) / totalCals) * 100,
    fat_pct: ((fat_g * 9) / totalCals) * 100,
  }
}
