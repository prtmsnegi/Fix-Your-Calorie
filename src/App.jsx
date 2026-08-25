import { useEffect, useState } from 'react'
import { AppProviders } from './context/AppProviders'
import { useProfile } from './context/ProfileContext'
import { useFoods } from './context/FoodsContext'
import { useCategories } from './context/CategoriesContext'
import { BottomNav } from './components/BottomNav'
import { Toast } from './components/Toast'
import { HomeScreen } from './screens/HomeScreen'
import { FoodsScreen } from './screens/FoodsScreen'
import { WeightScreen } from './screens/WeightScreen'
import { TrendsScreen } from './screens/TrendsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { importDefaultFoods, DEFAULT_FOODS_IMPORTED_KEY } from './utils/importDefaultFoods'

const SCREENS = {
  home: HomeScreen,
  foods: FoodsScreen,
  weight: WeightScreen,
  trends: TrendsScreen,
  settings: SettingsScreen,
}

function AppShell() {
  const [activeTab, setActiveTab] = useState('home')
  const { profile, isProfileSet } = useProfile()
  const { foods, addFood } = useFoods()
  const { addCategory } = useCategories()
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', Boolean(profile.dark_mode))
  }, [profile.dark_mode])

  // Mount-only: runs once per app load, not on every foods/addFood change.
  useEffect(() => {
    const alreadyImported = localStorage.getItem(DEFAULT_FOODS_IMPORTED_KEY)
    if (alreadyImported || foods.length > 0) return
    const { addedCount } = importDefaultFoods({ existingFoods: foods, addFood, addCategory })
    localStorage.setItem(DEFAULT_FOODS_IMPORTED_KEY, 'true')
    if (addedCount > 0) setToastMessage(`Imported ${addedCount} Indian foods to get you started`)
  }, [])

  const effectiveTab = isProfileSet ? activeTab : 'settings'
  const ActiveScreen = SCREENS[effectiveTab]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md mx-auto min-h-screen">
        {!isProfileSet && (
          <div className="bg-emerald-500 text-white text-xs text-center py-2 px-4">
            Welcome! Set up your body stats and goals to get started.
          </div>
        )}
        <ActiveScreen />
      </div>
      <BottomNav activeTab={effectiveTab} onChange={setActiveTab} />
      <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />
    </div>
  )
}

export default function App() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  )
}
