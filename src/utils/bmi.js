export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

export function getBMICategory(bmi) {
  if (bmi == null) return null
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

export const BMI_CATEGORY_COLORS = {
  Underweight: 'text-blue-500',
  Normal: 'text-emerald-500',
  Overweight: 'text-amber-500',
  Obese: 'text-red-500',
}
