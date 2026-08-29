import { daysBetween } from './dateUtils'

// entries: sorted ascending [{date, weight_kg}], logged days only.
// Returns [{date, weight_kg, moving_avg}] with a trailing 7-calendar-day simple
// moving average computed over whatever logged entries fall in that window.
export function computeMovingAverage(entries, windowDays = 7, field = 'weight_kg') {
  return entries.map((entry, i) => {
    const windowEntries = []
    for (let j = i; j >= 0; j--) {
      if (daysBetween(entries[j].date, entry.date) < windowDays) {
        windowEntries.push(entries[j])
      } else {
        break
      }
    }
    const avg = windowEntries.reduce((sum, e) => sum + e[field], 0) / windowEntries.length
    return { ...entry, moving_avg: Number(avg.toFixed(2)) }
  })
}

// Filters logged entries to the trailing N calendar days (default 4 weeks) relative
// to the most recent entry.
export function filterToTrailingDays(entries, days = 28) {
  if (entries.length === 0) return []
  const latestDate = entries[entries.length - 1].date
  return entries.filter((e) => daysBetween(e.date, latestDate) <= days)
}
