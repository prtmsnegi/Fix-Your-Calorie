export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little/no exercise)', factor: 1.2 },
  { value: 'light', label: 'Light (exercise 1-3 days/wk)', factor: 1.375 },
  { value: 'moderate', label: 'Moderate (exercise 3-5 days/wk)', factor: 1.55 },
  { value: 'active', label: 'Active (exercise 6-7 days/wk)', factor: 1.725 },
  { value: 'very_active', label: 'Very active (hard exercise daily)', factor: 1.9 },
]

export function getActivityFactor(level) {
  const found = ACTIVITY_LEVELS.find((a) => a.value === level)
  return found ? found.factor : 1.55
}
