import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react'
import { useDailyLogs } from '../context/DailyLogsContext'
import { useFoods } from '../context/FoodsContext'
import { useProfile } from '../context/ProfileContext'
import { getLoggedWeightEntries, getTrendStatus } from '../utils/weightTrend'
import { computeMovingAverage, filterToTrailingDays } from '../utils/movingAverage'
import { computeDailyTotals } from '../utils/nutrition'
import { formatShortDate, addDays, todayStr } from '../utils/dateUtils'
import { EmptyState } from '../components/EmptyState'

const STATUS_CONFIG = {
  on_track: { label: 'On Track', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', Icon: TrendingUp },
  trend_alert: { label: 'Trend Alert', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', Icon: AlertTriangle },
  insufficient_data: { label: 'Not enough data yet', color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800', Icon: HelpCircle },
}

export function TrendsScreen() {
  const { dailyLogs } = useDailyLogs()
  const { foods } = useFoods()
  const { profile } = useProfile()

  const chartData = useMemo(() => {
    const logged = getLoggedWeightEntries(dailyLogs)
    const trailing = filterToTrailingDays(logged, 28)
    return computeMovingAverage(trailing)
  }, [dailyLogs])

  const status = useMemo(() => {
    if (chartData.length === 0) return 'insufficient_data'
    return getTrendStatus(chartData, profile.goal_weight, chartData[0].weight_kg)
  }, [chartData, profile.goal_weight])

  const weeklyAvgCalories = useMemo(() => {
    const today = todayStr()
    let sum = 0
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, -i)
      const log = dailyLogs[date]
      if (log) sum += computeDailyTotals(log.meals, foods).calories
    }
    return sum / 7
  }, [dailyLogs, foods])

  const { label, color, bg, Icon } = STATUS_CONFIG[status]

  return (
    <div className="px-4 pt-4 pb-24">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-3">4-Week Weight Trend</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 mb-4">
        {chartData.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No weight data yet" subtitle="Log weight entries to see your trend" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200, #e5e7eb)" />
              <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 10 }} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} width={32} tick={{ fontSize: 10 }} />
              <Tooltip labelFormatter={formatShortDate} formatter={(v) => `${v} kg`} />
              <Line type="monotone" dataKey="weight_kg" stroke="#10b981" dot={{ r: 3 }} name="Weight" />
              <Line type="monotone" dataKey="moving_avg" stroke="#6366f1" dot={false} strokeDasharray="4 2" name="7-day avg" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-3 ${bg}`}>
        <Icon size={18} className={color} />
        <span className={`text-sm font-semibold ${color}`}>{label}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">Weekly Average Calories</p>
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-0.5">
          {Math.round(weeklyAvgCalories)} / day
        </p>
      </div>
    </div>
  )
}
