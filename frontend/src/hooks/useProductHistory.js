import { useCallback, useEffect, useRef, useState } from 'react'
import { getProductHistory } from '../services/products'

// Same pattern as useProducts(): { data, stats, isLoading, error, refetch }.
//
// getProductHistory(url) currently returns `data` from the backend
// as-is (see services/products.js) — normalizeHistory() below handles
// either a raw array or a { history: [...] } wrapper, so this works
// regardless of which shape the backend actually sends.
function normalizeHistory(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.history)) return response.history
  return []
}

function computeStats(history) {
  if (!history || history.length === 0) {
    return {
      currentPrice: null,
      lowestPrice: null,
      highestPrice: null,
      averagePrice: null,
      lastScrapedAt: null,
      changePercent: null,
    }
  }

  const prices = history.map((row) => row.price).filter((p) => typeof p === 'number')
  const currentPrice = history[history.length - 1]?.price ?? null
  const firstPrice = history[0]?.price ?? null
  const lowestPrice = prices.length ? Math.min(...prices) : null
  const highestPrice = prices.length ? Math.max(...prices) : null
  const averagePrice = prices.length
    ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
    : null
  const lastScrapedAt = history[history.length - 1]?.scraped_at ?? null
  const changePercent =
    typeof currentPrice === 'number' && typeof firstPrice === 'number' && firstPrice !== 0
      ? Math.round(((currentPrice - firstPrice) / firstPrice) * 1000) / 10
      : null

  return { currentPrice, lowestPrice, highestPrice, averagePrice, lastScrapedAt, changePercent }
}

export function useProductHistory(url) {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const requestId = useRef(0)

  const fetchHistory = useCallback(() => {
    if (!url) {
      setIsLoading(false)
      return
    }
    const currentRequest = ++requestId.current
    setIsLoading(true)
    setError(null)

    getProductHistory(url)
      .then((response) => {
        if (requestId.current !== currentRequest) return
        setData(normalizeHistory(response))
      })
      .catch((err) => {
        if (requestId.current !== currentRequest) return
        setError(err.message || 'Failed to load price history.')
      })
      .finally(() => {
        if (requestId.current !== currentRequest) return
        setIsLoading(false)
      })
  }, [url])

  /* eslint-disable react-hooks/set-state-in-effect -- standard fetch-on-mount; fetchHistory guards against stale responses via requestId */
  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])
  /* eslint-enable react-hooks/set-state-in-effect */

  const stats = computeStats(data)

  return { data, stats, isLoading, error, refetch: fetchHistory }
}

// Used by the Price History tab's 7D/30D/90D filter.
export function filterHistoryByRange(history, rangeDays) {
  if (!history || !rangeDays) return history ?? []
  const cutoff = Date.now() - rangeDays * 24 * 60 * 60 * 1000
  return history.filter((row) => {
    const t = new Date(row.scraped_at).getTime()
    return Number.isFinite(t) && t >= cutoff
  })
}