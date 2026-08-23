const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl'

export async function searchOpenFoodFacts(query, { pageSize = 15, signal } = {}) {
  const q = query.trim()
  if (!q) return []

  const params = new URLSearchParams({
    search_terms: q,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: String(pageSize),
  })

  let res
  try {
    res = await fetch(`${SEARCH_URL}?${params}`, { signal })
  } catch {
    throw new Error('Network error — check your connection and try again.')
  }
  if (!res.ok) throw new Error(`Open Food Facts request failed (${res.status})`)

  const data = await res.json()
  return (data.products || [])
    .filter((p) => p.product_name && p.nutriments?.['energy-kcal_100g'] != null)
    .map((p) => ({
      externalId: p.code || p._id || p.id,
      name: p.product_name,
      brand: p.brands || '',
      per100g: {
        calories: Number(p.nutriments['energy-kcal_100g']) || 0,
        protein_g: Number(p.nutriments.proteins_100g) || 0,
        carbs_g: Number(p.nutriments.carbohydrates_100g) || 0,
        fat_g: Number(p.nutriments.fat_100g) || 0,
      },
    }))
}

// Open Food Facts reports nutrition per 100g. This app's nutrition_per_unit is
// "per 1 unit", and 'g' is already a first-class unit, so we store per-gram
// (divide by 100) rather than introducing a separate "100g" unit concept.
export function toFoodFormValues(product, fallbackCategory) {
  const round2 = (n) => Math.round(n * 100) / 100
  return {
    name: product.name,
    category: fallbackCategory,
    unit: 'g',
    calories: round2(product.per100g.calories / 100),
    protein_g: round2(product.per100g.protein_g / 100),
    carbs_g: round2(product.per100g.carbs_g / 100),
    fat_g: round2(product.per100g.fat_g / 100),
    notes: product.brand ? `Imported from Open Food Facts (${product.brand})` : 'Imported from Open Food Facts',
  }
}
