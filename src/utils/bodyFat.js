// US Navy circumference method. All measurements in cm. Returns null if
// required inputs for the given gender are missing.
export function calculateNavyBodyFat({ gender, waist_cm, neck_cm, hip_cm, height_cm }) {
  if (!waist_cm || !neck_cm || !height_cm) return null
  if (gender === 'F') {
    if (!hip_cm) return null
    const c = waist_cm + hip_cm - neck_cm
    if (c <= 0) return null
    return 495 / (1.29579 - 0.35004 * Math.log10(c) + 0.22100 * Math.log10(height_cm)) - 450
  }
  const c = waist_cm - neck_cm
  if (c <= 0) return null
  return 495 / (1.0324 - 0.19077 * Math.log10(c) + 0.15456 * Math.log10(height_cm)) - 450
}
