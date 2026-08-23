import { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const DEFAULT_PROFILE = {
  height_cm: null,
  age: null,
  gender: 'M',
  goal_weight: null,
  goal_calories: 2000,
  goal_protein_pct: 30,
  goal_carbs_pct: 40,
  goal_fat_pct: 30,
  activity_level: 'moderate',
  dark_mode: false,
}

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useLocalStorage('calorie-tracker:profile', DEFAULT_PROFILE)

  const value = useMemo(() => {
    const updateProfile = (partial) => setProfile((prev) => ({ ...prev, ...partial }))
    const isProfileSet = Boolean(profile.height_cm && profile.age && profile.goal_weight)
    return { profile, updateProfile, isProfileSet }
  }, [profile, setProfile])

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
