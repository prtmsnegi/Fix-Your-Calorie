// Returns [{date, [field]: value}] sorted ascending by date, for whichever
// dates logged that particular measurement. Mirrors weightTrend.js's shape so
// getTrendDirection() (weightTrend.js) works on either with a field name.
export function getLoggedMeasurementEntries(dailyLogs, field) {
  return Object.entries(dailyLogs)
    .filter(([, log]) => log.measurements?.[field] != null)
    .map(([date, log]) => ({ date, [field]: log.measurements[field] }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

export function getRecentMeasurementEntries(dailyLogs, field, count = 2) {
  const entries = getLoggedMeasurementEntries(dailyLogs, field)
  return entries.slice(-count).reverse() // most recent first
}
