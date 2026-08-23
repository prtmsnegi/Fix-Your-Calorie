import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { searchOpenFoodFacts } from '../utils/openFoodFacts'

export function ExternalFoodSearch({ onPick }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error | success
  const [results, setResults] = useState([])
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!query.trim()) return
    setStatus('loading')
    setError('')
    try {
      const products = await searchOpenFoodFacts(query)
      setResults(products)
      setStatus('success')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setStatus('error')
    }
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2 bg-gray-50 dark:bg-gray-800/60">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch()
              }
            }}
            placeholder="Search Open Food Facts…"
            className="input pl-9"
          />
        </div>
        <button type="button" onClick={handleSearch} className="btn-primary shrink-0 px-3" disabled={status === 'loading'}>
          Search
        </button>
      </div>

      {status === 'loading' && (
        <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
          <Loader2 size={14} className="animate-spin" /> Searching…
        </div>
      )}

      {status === 'error' && <p className="text-xs text-red-500 py-1">{error}</p>}

      {status === 'success' && results.length === 0 && (
        <p className="text-xs text-gray-400 py-1">No products found. Try a different search term.</p>
      )}

      {status === 'success' && results.length > 0 && (
        <div className="max-h-48 overflow-y-auto -mx-1">
          {results.map((product) => (
            <button
              key={product.externalId}
              type="button"
              onClick={() => onPick(product)}
              className="w-full text-left px-2 py-2 flex items-center justify-between hover:bg-white dark:hover:bg-gray-800 rounded-lg"
            >
              <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                {product.name}
                {product.brand && <span className="text-gray-400"> ({product.brand})</span>}
              </span>
              <span className="text-xs text-gray-400 shrink-0 ml-2">{Math.round(product.per100g.calories)} cal/100g</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
