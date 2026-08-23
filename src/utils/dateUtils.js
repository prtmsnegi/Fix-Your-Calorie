export function toDateStr(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayStr() {
  return toDateStr(new Date())
}

export function formatDisplayDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatShortDate(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number)
  return `${m}/${d}`
}

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function daysBetween(dateStrA, dateStrB) {
  const [ya, ma, da] = dateStrA.split('-').map(Number)
  const [yb, mb, db] = dateStrB.split('-').map(Number)
  const a = new Date(ya, ma - 1, da)
  const b = new Date(yb, mb - 1, db)
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return toDateStr(date)
}

export function isMonWedFri(date = new Date()) {
  const day = date.getDay()
  return day === 1 || day === 3 || day === 5
}
