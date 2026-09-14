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
