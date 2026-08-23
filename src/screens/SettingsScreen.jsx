import { useState } from 'react'
import { useProfile } from '../context/ProfileContext'
import { useDailyLogs } from '../context/DailyLogsContext'
import { getRecentWeightEntries } from '../utils/weightTrend'
import { calculateBMR, calculateTDEE } from '../utils/tdee'
import { ACTIVITY_LEVELS, getActivityFactor } from '../constants/activityLevels'
import { InfoLabel } from '../components/InfoLabel'

export function SettingsScreen() {
  const { profile, updateProfile } = useProfile()
  const { dailyLogs } = useDailyLogs()

  const [form, setForm] = useState({
    height_cm: profile.height_cm ?? '',
    age: profile.age ?? '',
    gender: profile.gender ?? 'M',
    goal_weight: profile.goal_weight ?? '',
    goal_calories: profile.goal_calories ?? '',
    goal_protein_pct: profile.goal_protein_pct ?? 30,
    goal_carbs_pct: profile.goal_carbs_pct ?? 40,
    goal_fat_pct: profile.goal_fat_pct ?? 30,
    activity_level: profile.activity_level ?? 'moderate',
  })
  const [saved, setSaved] = useState(false)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setSaved(false)
  }

  const macroSum = Number(form.goal_protein_pct) + Number(form.goal_carbs_pct) + Number(form.goal_fat_pct)
  const macroValid = macroSum === 100

  const previewLatestWeight = getRecentWeightEntries(dailyLogs, 1)[0]?.weight_kg ?? null
  const previewWeightKg = previewLatestWeight ?? (Number(form.goal_weight) || null)
  const previewBmr = calculateBMR({
    weight_kg: previewWeightKg,
    height_cm: Number(form.height_cm) || null,
    age: Number(form.age) || null,
    gender: form.gender,
  })
  const previewTdee = calculateTDEE(previewBmr, form.activity_level)
  const previewActivityFactor = getActivityFactor(form.activity_level)

  const handleSave = (e) => {
    e.preventDefault()
    if (!macroValid) return
    updateProfile({
      height_cm: Number(form.height_cm) || null,
      age: Number(form.age) || null,
      gender: form.gender,
      goal_weight: Number(form.goal_weight) || null,
      goal_calories: Number(form.goal_calories) || 2000,
      goal_protein_pct: Number(form.goal_protein_pct),
      goal_carbs_pct: Number(form.goal_carbs_pct),
      goal_fat_pct: Number(form.goal_fat_pct),
      activity_level: form.activity_level,
    })
    setSaved(true)
  }

  const handleCalculateTdee = () => {
    if (!previewTdee) return
    setForm((f) => ({ ...f, goal_calories: Math.round(previewTdee) }))
    setSaved(false)
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-1">Body Stats & Goals</h1>
      <p className="text-xs text-gray-400 mb-4">One-time setup — edit anytime</p>

      <form onSubmit={handleSave} className="space-y-4">
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Body Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Height (cm)">
              <input type="number" inputMode="decimal" value={form.height_cm} onChange={set('height_cm')} className="input" />
            </Field>
            <Field label="Age">
              <input type="number" inputMode="numeric" value={form.age} onChange={set('age')} className="input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender">
              <select value={form.gender} onChange={set('gender')} className="input">
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </Field>
            <Field label="Goal Weight (kg)">
              <input type="number" inputMode="decimal" value={form.goal_weight} onChange={set('goal_weight')} className="input" />
            </Field>
          </div>
          <Field label="Activity Level">
            <select value={form.activity_level} onChange={set('activity_level')} className="input">
              {ACTIVITY_LEVELS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </Field>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <InfoLabel label="Calorie Goal" className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              BMR (Mifflin-St Jeor): men = 10×kg + 6.25×cm − 5×age + 5, women = 10×kg + 6.25×cm − 5×age − 161.
              TDEE = BMR × activity factor ({previewActivityFactor}).
              {previewBmr
                ? ` For you: BMR ≈ ${Math.round(previewBmr)}, TDEE ≈ ${Math.round(previewTdee)} cal.`
                : ' Enter height, age and log a weight to see this calculated.'}
            </InfoLabel>
            <button type="button" onClick={handleCalculateTdee} className="text-xs font-medium text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
              Calculate from TDEE
            </button>
          </div>
          <Field label="Daily Calorie Goal">
            <input type="number" inputMode="decimal" value={form.goal_calories} onChange={set('goal_calories')} className="input" />
          </Field>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Macro Goals (% of calories)</h2>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Protein %">
              <input type="number" inputMode="numeric" value={form.goal_protein_pct} onChange={set('goal_protein_pct')} className="input" />
            </Field>
            <Field label="Carbs %">
              <input type="number" inputMode="numeric" value={form.goal_carbs_pct} onChange={set('goal_carbs_pct')} className="input" />
            </Field>
            <Field label="Fat %">
              <input type="number" inputMode="numeric" value={form.goal_fat_pct} onChange={set('goal_fat_pct')} className="input" />
            </Field>
          </div>
          <p className={`text-xs ${macroValid ? 'text-gray-400' : 'text-red-500'}`}>
            Total: {macroSum}% {!macroValid && '— must add up to 100%'}
          </p>
        </section>

        <button type="submit" disabled={!macroValid} className="btn-primary w-full disabled:opacity-40">
          {saved ? 'Saved ✓' : 'Save Settings'}
        </button>
      </form>

      <section className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between mt-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Dark Mode</h2>
          <p className="text-xs text-gray-400">Switch the app to a dark color scheme</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={profile.dark_mode}
          onClick={() => updateProfile({ dark_mode: !profile.dark_mode })}
          className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${
            profile.dark_mode ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              profile.dark_mode ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </section>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</span>
      {children}
    </label>
  )
}
