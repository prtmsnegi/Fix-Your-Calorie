import { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const FoodsContext = createContext(null)

export function FoodsProvider({ children }) {
  const [foods, setFoods] = useLocalStorage('calorie-tracker:foods', [])

  const value = useMemo(() => {
    const addFood = (food) => {
      const newFood = { id: crypto.randomUUID(), notes: '', ...food }
      setFoods((prev) => [...prev, newFood])
      return newFood
    }

    const updateFood = (id, partial) => {
      setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, ...partial } : f)))
    }

    const deleteFood = (id) => {
      setFoods((prev) => prev.filter((f) => f.id !== id))
    }

    const getFoodById = (id) => foods.find((f) => f.id === id)

    const foodsByCategory = foods.reduce((acc, f) => {
      ;(acc[f.category] ||= []).push(f)
      return acc
    }, {})

    const searchFoods = (query) => {
      const q = query.trim().toLowerCase()
      if (!q) return foods
      return foods.filter((f) => f.name.toLowerCase().includes(q))
    }

    return { foods, addFood, updateFood, deleteFood, getFoodById, foodsByCategory, searchFoods }
  }, [foods, setFoods])

  return <FoodsContext.Provider value={value}>{children}</FoodsContext.Provider>
}

export function useFoods() {
  const ctx = useContext(FoodsContext)
  if (!ctx) throw new Error('useFoods must be used within FoodsProvider')
  return ctx
}
