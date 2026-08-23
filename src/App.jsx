import { useEffect, useState } from 'react'
import { AppProviders } from './context/AppProviders'
import { useProfile } from './context/ProfileContext'
import { BottomNav } from './components/BottomNav'
import { HomeScreen } from './screens/HomeScreen'
import { FoodsScreen } from './screens/FoodsScreen'
import { WeightScreen } from './screens/WeightScreen'
import { TrendsScreen } from './screens/TrendsScreen'
import { SettingsScreen } from './screens/SettingsScreen'

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', Boolean(profile.dark_mode))
  }, [profile.dark_mode])

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
