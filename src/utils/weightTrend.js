import { todayStr, addDays } from './dateUtils'
import { calculateNavyBodyFat } from './bodyFat'

// Dense day-by-day series (one entry per calendar day over the trailing `days`
// days ending today) merging weight and Navy body-fat % so both render on one
// chart. Each value carries forward from the last logged input until a newer
// one arrives — weight from weight_kg, body fat from whichever of
// waist/neck/hip measurements were last logged (independently of each other,
// since they need not be logged together). Days before the very first
// relevant log are left null (nothing to carry forward yet).
export function getWeightAndBodyFatSeries(dailyLogs, profile, days) {
  const today = todayStr()
  const series = []
  let lastWeight = null
  let lastWaist = null
  let lastNeck = null
  let lastHip = null
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i)
    const log = dailyLogs[date]
    if (log?.weight_kg != null) lastWeight = log.weight_kg
    const m = log?.measurements
    if (m?.waist_cm != null) lastWaist = m.waist_cm
    if (m?.neck_cm != null) lastNeck = m.neck_cm
    if (m?.hips_cm != null) lastHip = m.hips_cm
    const body_fat_pct = calculateNavyBodyFat({
      gender: profile.gender,
      waist_cm: lastWaist,
      neck_cm: lastNeck,
      hip_cm: lastHip,
      height_cm: profile.height_cm,
    })
    // Flags distinguish a real log from a carried-forward value, so the chart
    // can draw a dot only where the user actually logged something that day.
    series.push({
      date,
      weight_kg: lastWeight,
      weight_logged: log?.weight_kg != null,
      body_fat_pct,
      body_fat_logged: Boolean(m && (m.waist_cm != null || m.neck_cm != null || m.hips_cm != null) && body_fat_pct != null),
    })
  }
  return series
}

// Returns [{date, weight_kg}] sorted ascending by date, logged days only.
export function getLoggedWeightEntries(dailyLogs) {
  return Object.entries(dailyLogs)
    .filter(([, log]) => log.weight_kg != null)
    .map(([date, log]) => ({ date, weight_kg: log.weight_kg }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

export function getRecentWeightEntries(dailyLogs, count = 3) {
  const entries = getLoggedWeightEntries(dailyLogs)
  return entries.slice(-count).reverse() // most recent first
}

// direction: 'up' | 'down' | 'flat' comparing entry to the previous logged entry.
// field defaults to weight_kg but any *_entries array shaped {date, [field]: n}
// (e.g. from measurementTrend.js) works too.
export function getTrendDirection(entries, index, field = 'weight_kg') {
  if (index >= entries.length - 1) return 'flat'
  const current = entries[index][field]
  const previous = entries[index + 1][field]
  const delta = current - previous
  if (Math.abs(delta) < 0.05) return 'flat'
  return delta > 0 ? 'up' : 'down'
}

const TOLERANCE_KG = 0.2

export function getTrendStatus(movingAvgSeries, goalWeight, startWeight) {
  if (!movingAvgSeries || movingAvgSeries.length < 2) return 'insufficient_data'
  if (goalWeight == null || startWeight == null) return 'insufficient_data'

  const directionNeeded = goalWeight < startWeight - TOLERANCE_KG
    ? 'lose'
    : goalWeight > startWeight + TOLERANCE_KG
      ? 'gain'
      : 'maintain'

  const last = movingAvgSeries[movingAvgSeries.length - 1].moving_avg
  const compareIndex = Math.max(0, movingAvgSeries.length - 8)
  const reference = movingAvgSeries[compareIndex].moving_avg
  const slope = last - reference

  if (directionNeeded === 'maintain') {
    return Math.abs(slope) <= TOLERANCE_KG ? 'on_track' : 'trend_alert'
  }
  if (directionNeeded === 'lose') {
    return slope <= TOLERANCE_KG ? 'on_track' : 'trend_alert'
  }
  return slope >= -TOLERANCE_KG ? 'on_track' : 'trend_alert'
}
