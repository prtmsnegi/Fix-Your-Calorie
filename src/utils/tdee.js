import { getActivityFactor } from '../constants/activityLevels'

export function calculateBMR({ weight_kg, height_cm, age, gender }) {
  if (!weight_kg || !height_cm || !age) return null
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age
  return gender === 'F' ? base - 161 : base + 5
}

export function calculateTDEE(bmr, activityLevel) {
  if (bmr == null) return null
  return bmr * getActivityFactor(activityLevel)
}
