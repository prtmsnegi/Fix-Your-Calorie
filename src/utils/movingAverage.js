import { daysBetween, todayStr, addDays } from './dateUtils'
import { computeDailyTotals } from './nutrition'

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

// Average calories/day over the trailing `days` days ending today, counting only
// days with at least one logged meal — an off day (no log) doesn't drag the
// average down the way including it as zero would.
export function getAverageExcludingZeroDays(dailyLogs, foods, days) {
  const today = todayStr()
  let sum = 0
  let loggedDays = 0
  for (let i = 0; i < days; i++) {
    const date = addDays(today, -i)
    const log = dailyLogs[date]
    if (log && log.meals.length > 0) {
      sum += computeDailyTotals(log.meals, foods).calories
      loggedDays += 1
    }
  }
  return loggedDays > 0 ? sum / loggedDays : 0
}
