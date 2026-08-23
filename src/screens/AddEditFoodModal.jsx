import { useState } from 'react'
import { Modal } from '../components/Modal'
import { AddCategoryInline } from '../components/AddCategoryInline'
import { ExternalFoodSearch } from '../components/ExternalFoodSearch'
import { useCategories } from '../context/CategoriesContext'
import { DEFAULT_CATEGORIES } from '../constants/categories'
import { UNITS } from '../constants/units'
import { toFoodFormValues } from '../utils/openFoodFacts'

const NEW_CATEGORY_SENTINEL = '__new_category__'

const emptyForm = {
  name: '',
  category: DEFAULT_CATEGORIES[0],
  unit: UNITS[0],
  calories: '',
  protein_g: '',
  carbs_g: '',
  fat_g: '',
  notes: '',
}

export function AddEditFoodModal({ food, onSave, onClose }) {
  const { categories, addCategory } = useCategories()
  const [form, setForm] = useState(() =>
    food
      ? {
          name: food.name,
          category: food.category,
          unit: food.nutrition_per_unit.unit,
          calories: food.nutrition_per_unit.calories,
          protein_g: food.nutrition_per_unit.protein_g,
          carbs_g: food.nutrition_per_unit.carbs_g,
          fat_g: food.nutrition_per_unit.fat_g,
          notes: food.notes || '',
        }
      : emptyForm,
  )
  const [addingCategory, setAddingCategory] = useState(false)
  const [showExternalSearch, setShowExternalSearch] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handlePrefillFromExternal = (product) => {
    setForm((f) => ({ ...f, ...toFoodFormValues(product, f.category) }))
    setShowExternalSearch(false)
  }

  const handleCategoryChange = (e) => {
    if (e.target.value === NEW_CATEGORY_SENTINEL) {
      setAddingCategory(true)
      return
    }
    setForm((f) => ({ ...f, category: e.target.value }))
  }

  const isValid = form.name.trim() && form.calories !== '' && !Number.isNaN(Number(form.calories))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValid) return
    onSave({
      name: form.name.trim(),
      category: form.category,
      notes: form.notes.trim(),
      nutrition_per_unit: {
        unit: form.unit,
        calories: Number(form.calories) || 0,
        protein_g: Number(form.protein_g) || 0,
        carbs_g: Number(form.carbs_g) || 0,
        fat_g: Number(form.fat_g) || 0,
      },
    })
  }

  return (
    <Modal title={food ? 'Edit Food' : 'Add New Food'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {!food && (
          <div>
            <button
              type="button"
              onClick={() => setShowExternalSearch((s) => !s)}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400"
            >
              {showExternalSearch ? 'Hide external search' : 'Prefill from Open Food Facts'}
            </button>
            {showExternalSearch && (
              <div className="mt-2">
                <ExternalFoodSearch onPick={handlePrefillFromExternal} />
              </div>
            )}
          </div>
        )}

        <Field label="Food name">
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Roti (Whole Wheat)"
            className="input"
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          {addingCategory ? (
            <div className="col-span-2">
              <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">New Category</span>
              <AddCategoryInline
                onAdd={(name) => {
                  const added = addCategory(name)
                  if (added) setForm((f) => ({ ...f, category: added }))
                  setAddingCategory(false)
                }}
                onCancel={() => setAddingCategory(false)}
              />
            </div>
          ) : (
            <Field label="Category">
              <select value={form.category} onChange={handleCategoryChange} className="input">
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value={NEW_CATEGORY_SENTINEL}>+ Add new category…</option>
              </select>
            </Field>
          )}
          <Field label="Unit">
            <select value={form.unit} onChange={set('unit')} className="input">
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label={`Calories per ${form.unit}`}>
          <input type="number" inputMode="decimal" value={form.calories} onChange={set('calories')} className="input" />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Protein (g)">
            <input type="number" inputMode="decimal" value={form.protein_g} onChange={set('protein_g')} className="input" />
          </Field>
          <Field label="Carbs (g)">
            <input type="number" inputMode="decimal" value={form.carbs_g} onChange={set('carbs_g')} className="input" />
          </Field>
          <Field label="Fat (g)">
            <input type="number" inputMode="decimal" value={form.fat_g} onChange={set('fat_g')} className="input" />
          </Field>
        </div>

        <Field label="Notes (optional)">
          <input type="text" value={form.notes} onChange={set('notes')} className="input" />
        </Field>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={!isValid} className="btn-primary flex-1 disabled:opacity-40">
            {food ? 'Save Changes' : 'Add Food'}
          </button>
        </div>
      </form>
    </Modal>
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
