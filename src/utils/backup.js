import { DEFAULT_FOODS_IMPORTED_KEY } from './importDefaultFoods'

const BACKUP_APP_ID = 'calorie-tracker'
const BACKUP_VERSION = 1

export function createBackup({ profile, foods, dailyLogs, customCategories }) {
  const backup = {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: { profile, foods, dailyLogs, customCategories },
  }
  return JSON.stringify(backup, null, 2)
}

export function parseBackup(jsonText) {
  let parsed
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('This file is not valid JSON.')
  }

  if (parsed?.app !== BACKUP_APP_ID) {
    throw new Error('This file is not a Calorie Tracker backup.')
  }

  const { data } = parsed
  if (
    !data ||
    typeof data.profile !== 'object' ||
    !Array.isArray(data.foods) ||
    typeof data.dailyLogs !== 'object' ||
    !Array.isArray(data.customCategories)
  ) {
    throw new Error('This backup file is missing or has malformed data.')
  }

  return data
}

export function applyBackup(data, { updateProfile, replaceFoods, replaceDailyLogs, replaceCategories }) {
  updateProfile(data.profile)
  replaceFoods(data.foods)
  replaceDailyLogs(data.dailyLogs)
  replaceCategories(data.customCategories)
  localStorage.setItem(DEFAULT_FOODS_IMPORTED_KEY, 'true')
}
