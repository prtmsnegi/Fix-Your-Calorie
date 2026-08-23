import { useState } from 'react'
import { Info } from 'lucide-react'

export function InfoLabel({ label, className = '', children }) {
  const [open, setOpen] = useState(false)

  return (
    <span className={className}>
      {label}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        aria-expanded={open}
        aria-label="How is this calculated?"
        className="ml-1 inline-flex align-middle text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400"
      >
        <Info size={13} />
      </button>
      {open && (
        <span className="block mt-1.5 text-xs font-normal leading-relaxed text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-lg p-2.5">
          {children}
        </span>
      )}
    </span>
  )
}
