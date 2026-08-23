import { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DEFAULT_CATEGORIES } from '../constants/categories'

const CategoriesContext = createContext(null)

export function CategoriesProvider({ children }) {
  const [customCategories, setCustomCategories] = useLocalStorage('calorie-tracker:custom-categories', [])

  const value = useMemo(() => {
    const categories = [...DEFAULT_CATEGORIES, ...customCategories]

    const isDefaultCategory = (name) => DEFAULT_CATEGORIES.includes(name)

    const addCategory = (name) => {
      const trimmed = name.trim()
      if (!trimmed) return null
      const existing = categories.find((c) => c.toLowerCase() === trimmed.toLowerCase())
      if (existing) return existing
      setCustomCategories((prev) => [...prev, trimmed])
      return trimmed
    }

    return { categories, defaultCategories: DEFAULT_CATEGORIES, customCategories, addCategory, isDefaultCategory }
  }, [customCategories, setCustomCategories])

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error('useCategories must be used within CategoriesProvider')
  return ctx
}
