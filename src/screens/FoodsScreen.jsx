import { useMemo, useState } from 'react'
import { Search, Plus, UtensilsCrossed, Download } from 'lucide-react'
import { useFoods } from '../context/FoodsContext'
import { useCategories } from '../context/CategoriesContext'
import { CategoryChip } from '../components/CategoryChip'
import { AddCategoryInline } from '../components/AddCategoryInline'
import { FoodListItem } from '../components/FoodListItem'
import { EmptyState } from '../components/EmptyState'
import { Toast } from '../components/Toast'
import { AddEditFoodModal } from './AddEditFoodModal'
import { importDefaultFoods, DEFAULT_FOODS_IMPORTED_KEY } from '../utils/importDefaultFoods'

export function FoodsScreen() {
  const { foods, addFood, updateFood, deleteFood } = useFoods()
  const { categories, addCategory } = useCategories()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [modalState, setModalState] = useState(null) // null | 'new' | food object
  const [addingCategory, setAddingCategory] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const handleImportDefaults = () => {
    const { addedCount, totalCount } = importDefaultFoods({ existingFoods: foods, addFood, addCategory })
    localStorage.setItem(DEFAULT_FOODS_IMPORTED_KEY, 'true')
    setToastMessage(
      addedCount > 0
        ? `Imported ${addedCount} new Indian food${addedCount === 1 ? '' : 's'}`
        : `All ${totalCount} reference foods are already in your database`,
    )
  }

  const filtered = useMemo(() => {
    return foods.filter((f) => {
      const matchesQuery = f.name.toLowerCase().includes(query.trim().toLowerCase())
      const matchesCategory = category === 'All' || f.category === category
      return matchesQuery && matchesCategory
    })
  }, [foods, query, category])

  const grouped = useMemo(() => {
    const cats = category === 'All' ? categories : [category]
    return cats
      .map((cat) => ({ cat, items: filtered.filter((f) => f.category === cat) }))
      .filter((g) => g.items.length > 0)
  }, [filtered, category])

  const handleSave = (data) => {
    if (modalState && modalState !== 'new') {
      updateFood(modalState.id, data)
    } else {
      addFood(data)
    }
    setModalState(null)
  }

  const handleDelete = (food) => {
    if (confirm(`Delete "${food.name}"? Past logs referencing it will show a "deleted food" fallback.`)) {
      deleteFood(food.id)
    }
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">My Foods Database</h1>
        <button
          onClick={handleImportDefaults}
          className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
        >
          <Download size={14} /> Import Default Foods
        </button>
      </div>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods..."
          className="input pl-9"
        />
      </div>

      {addingCategory ? (
        <AddCategoryInline
          className="mb-3"
          onAdd={(name) => {
            const added = addCategory(name)
            if (added) setCategory(added)
            setAddingCategory(false)
          }}
          onCancel={() => setAddingCategory(false)}
        />
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
          <CategoryChip label="All" active={category === 'All'} onClick={() => setCategory('All')} />
          {categories.map((c) => (
            <CategoryChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
          ))}
          <CategoryChip label="+ New" active={false} onClick={() => setAddingCategory(true)} />
        </div>
      )}

      {grouped.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No foods yet"
          subtitle="Add your first food to start building your database"
        />
      ) : (
        grouped.map(({ cat, items }) => (
          <div key={cat} className="mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
              {cat}S ({items.length})
            </h2>
            {items.map((food) => (
              <FoodListItem
                key={food.id}
                food={food}
                onEdit={(f) => setModalState(f)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ))
      )}

      <button
        onClick={() => setModalState('new')}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center active:bg-emerald-600"
        aria-label="Add new food"
      >
        <Plus size={26} />
      </button>

      {modalState && (
        <AddEditFoodModal
          food={modalState === 'new' ? null : modalState}
          onSave={handleSave}
          onClose={() => setModalState(null)}
        />
      )}

      <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />
    </div>
  )
}
