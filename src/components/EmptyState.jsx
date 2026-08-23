export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 text-gray-400">
      {Icon && <Icon size={32} className="mb-2 opacity-60" />}
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      {subtitle && <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">{subtitle}</p>}
    </div>
  )
}
