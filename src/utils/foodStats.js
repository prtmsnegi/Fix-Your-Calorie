// Counts how many times each food has been logged across all daily logs, for
// ranking foods by usage frequency (most-used first) rather than just recency.
// Quick-entry meals (food_id null) aren't tied to a food, so they're skipped.
export function getFrequencyStats(dailyLogs) {
  const counts = new Map()
  Object.values(dailyLogs).forEach((log) => {
    log.meals.forEach((m) => {
      if (!m.food_id) return
      counts.set(m.food_id, (counts.get(m.food_id) || 0) + 1)
    })
  })
  return counts
}
