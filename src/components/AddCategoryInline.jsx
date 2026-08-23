import { useState } from 'react'

export function AddCategoryInline({ onAdd, onCancel, className = '' }) {
  const [name, setName] = useState('')

  const confirm = () => {
    const trimmed = name.trim()
    if (trimmed) onAdd(trimmed)
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <input
        autoFocus
        type="text"
        value={name}
        placeholder="New category name"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            confirm()
          }
          if (e.key === 'Escape') onCancel()
        }}
        className="input"
      />
      <button type="button" onClick={confirm} className="btn-primary shrink-0 px-3">
        Add
      </button>
      <button type="button" onClick={onCancel} className="btn-secondary shrink-0 px-3">
        Cancel
      </button>
    </div>
  )
}
