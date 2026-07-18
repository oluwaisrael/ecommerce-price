// mockProductData.js
//
// Isolation layer for anything NOT backed by a real endpoint yet.
// Every function here takes the real `product` object (whatever
// getProducts()/getProductHistory() actually returns) and returns
// mocked fields alongside it.
//
// When a real backend exists for one of these, replace only the
// function body — callers (hooks/components) don't change.

// TODO(backend): replace with a real GET /api/products/:id/prediction
// call once a model exists. Consumers only rely on this return shape:
// { trend, confidence, predictedPrice, changePercent, points, reasoning, isMocked }
export function getMockPrediction(product, currentPrice) {
  const seed = hashSeed(product?.url ?? product?.id ?? 'seed')
  const trend = ['rising', 'falling', 'stable'][Math.floor(seed * 3)]

  const basePrice = typeof currentPrice === 'number' ? currentPrice : product?.price ?? 0

  const changePercent =
    trend === 'rising'
      ? +(4 + seed * 10).toFixed(1)
      : trend === 'falling'
        ? -(4 + seed * 10).toFixed(1)
        : +((seed - 0.5) * 3).toFixed(1)

  const predictedPrice = Math.round(basePrice * (1 + changePercent / 100))

  const confidence = Math.round(55 + seed * 35) // 55-90

  // short mocked trend series for a chart, drifting from basePrice to predictedPrice
  const points = Array.from({ length: 7 }, (_, i) => {
    const t = i / 6
    const noise = (hashSeed(`${seed}-${i}`) - 0.5) * basePrice * 0.02
    return Math.max(0, Math.round(basePrice + (predictedPrice - basePrice) * t + noise))
  })

  const reasoning =
    trend === 'rising'
      ? 'Recent price movement trends upward with limited discounting activity.'
      : trend === 'falling'
        ? 'Recent price movement shows a pattern of markdowns or periodic discounting.'
        : 'Price has stayed within a narrow band recently, with no clear directional pressure.'

  return {
    trend,
    confidence,
    predictedPrice,
    changePercent,
    points,
    reasoning,
    isMocked: true,
  }
}

// TODO(backend): replace once description is scraped/stored.
export function getMockDescription(product) {
  const name = product?.product_name ?? product?.name ?? 'This product'
  return `${name} is listed on ${product?.site ?? 'this marketplace'}. A full description isn't available from our data source yet.`
}

// TODO(backend): replace once specifications are scraped/stored.
export function getMockSpecifications(product) {
  return [
    { label: 'Brand', value: getMockBrand(product) },
    { label: 'Category', value: product?.category ?? 'Uncategorized' },
    { label: 'Condition', value: 'New' },
  ]
}

// TODO(backend): replace once brand is scraped/stored.
export function getMockBrand(product) {
  const name = product?.product_name ?? product?.name ?? ''
  return name.trim().split(/\s+/)[0] || 'Unknown'
}

// deterministic 0-1 pseudo-random value from a string, so mock data
// is stable across re-renders instead of jumping around
function hashSeed(str) {
  let hash = 0
  const s = String(str)
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash % 1000) / 1000
}