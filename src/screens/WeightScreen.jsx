import { useMemo, useState } from 'react'
import { Plus, Scale } from 'lucide-react'
import { useDailyLogs } from '../context/DailyLogsContext'
import { useProfile } from '../context/ProfileContext'
import { getRecentWeightEntries, getTrendDirection } from '../utils/weightTrend'
import { calculateBMI, getBMICategory, BMI_CATEGORY_COLORS } from '../utils/bmi'
import { todayStr, isMonWedFri, get7DaysAgoStr } from '../utils/dateUtils'
import { WeightEntryRow } from '../components/WeightEntryRow'
import { StatCard } from '../components/StatCard'
import { EmptyState } from '../components/EmptyState'
import { Modal } from '../components/Modal'
import { InfoLabel } from '../components/InfoLabel'

export function WeightScreen() {
  const { dailyLogs, setWeight } = useDailyLogs()
  const { profile } = useProfile()

  const [showLog, setShowLog] = useState(false)
  const [inputDate, setInputDate] = useState(todayStr())
  const [inputWeight, setInputWeight] = useState('')

  const recentEntries = useMemo(() => getRecentWeightEntries(dailyLogs, 3), [dailyLogs])
  const latestWeight = recentEntries[0]?.weight_kg ?? null

  const bmi = calculateBMI(latestWeight, profile.height_cm)
  const bmiCategory = getBMICategory(bmi)

  const showScheduleHint = isMonWedFri() && dailyLogs[todayStr()]?.weight_kg == null

  const handleLog = (e) => {
    e.preventDefault()
    const val = Number(inputWeight)
    if (!val || val <= 0) return
    setWeight(inputDate, val)
    setShowLog(false)
    setInputWeight('')
  }

  const openLogModal = () => {
    setInputDate(todayStr())
    setInputWeight('')
    setShowLog(true)
  }

  const openEditModal = (entry) => {
    setInputDate(entry.date)
    setInputWeight(String(entry.weight_kg))
    setShowLog(true)
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-3">Weight Tracking</h1>

      {showScheduleHint && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-3 py-2 mb-3">
          Today's a suggested weigh-in day (Mon/Wed/Fri) — you haven't logged yet.
        </p>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Last Weight Entries</h2>
        {recentEntries.length === 0 ? (
          <EmptyState icon={Scale} title="No weight logged yet" subtitle="Log your first entry below" />
        ) : (
          recentEntries.map((entry, i) => (
            <WeightEntryRow
              key={entry.date}
              date={entry.date}
              weight_kg={entry.weight_kg}
              direction={getTrendDirection(recentEntries, i)}
              onClick={() => openEditModal(entry)}
            />
          ))
        )}
      </div>

      <button
        onClick={openLogModal}
        className="w-full mb-4 btn-primary flex items-center justify-center gap-2"
      >
        <Plus size={18} /> Log Weight
      </button>

      <div className="flex gap-3 mb-4">
        <StatCard
          label={
            <InfoLabel label="BMI">
              BMI = weight (kg) ÷ height (m)².
              {latestWeight && profile.height_cm
                ? ` For you: ${latestWeight} ÷ (${(profile.height_cm / 100).toFixed(2)})² = ${bmi.toFixed(1)}.`
                : ' Log a weight entry and set your height in Settings to see this calculated.'}
            </InfoLabel>
          }
          value={bmi ? bmi.toFixed(1) : '—'}
          sublabel={bmiCategory || 'Log weight & set height'}
          valueClassName={bmiCategory ? BMI_CATEGORY_COLORS[bmiCategory] : ''}
        />
        <StatCard
          label="Goal Weight"
          value={profile.goal_weight ? `${profile.goal_weight} kg` : '—'}
          sublabel={latestWeight ? `Current: ${latestWeight} kg` : undefined}
        />
      </div>

      {showLog && (
        <Modal title={inputDate === todayStr() ? 'Log Weight' : 'Edit Weight'} onClose={() => setShowLog(false)}>
          <form onSubmit={handleLog} className="space-y-3">
            <label className="block">
              <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date</span>
              <input
                type="date"
                value={inputDate}
                min={get7DaysAgoStr()}
                max={todayStr()}
                onChange={(e) => setInputDate(e.target.value)}
                className="input"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Weight (kg)</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={inputWeight}
                onChange={(e) => setInputWeight(e.target.value)}
                placeholder="e.g. 75.2"
                className="input"
                autoFocus
              />
            </label>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowLog(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
