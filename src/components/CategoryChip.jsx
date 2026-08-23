export function CategoryChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        active
          ? 'bg-emerald-500 text-white border-emerald-500'
          : 'bg-white text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
      }`}
    >
      {label}
    </button>
  )
}
