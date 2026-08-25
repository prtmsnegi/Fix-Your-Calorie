import { DEFAULT_FOODS } from '../data/defaultFoods'

export const DEFAULT_FOODS_IMPORTED_KEY = 'calorie-tracker:defaultFoodsImported'

// Not a hook — needs both Foods and Categories context functions, and contexts in
// this app deliberately don't call each other (see FoodsContext.jsx). Callers pass
// in what they already have from useFoods()/useCategories().
export function importDefaultFoods({ existingFoods, addFood, addCategory }) {
  const neededCategories = [...new Set(DEFAULT_FOODS.map((f) => f.category))]
  neededCategories.forEach((c) => addCategory(c))

  const existingIds = new Set(existingFoods.map((f) => f.id))
  const toAdd = DEFAULT_FOODS.filter((f) => !existingIds.has(f.id))
  toAdd.forEach((f) => addFood(f))

  return { addedCount: toAdd.length, totalCount: DEFAULT_FOODS.length }
}
