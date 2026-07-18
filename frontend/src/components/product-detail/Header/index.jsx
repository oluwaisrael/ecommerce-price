import { useState } from 'react'
import { BASE_URL } from '../../../api/client'
import { useProductHistory } from '../../../hooks/useProductHistory'
import styles from './Header.module.css'

function formatPrice(price) {
  if (typeof price !== 'number') return '—'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price)
}

function proxiedImageUrl(imageUrl) {
  if (!imageUrl) return null
  return `${BASE_URL}/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
}

function formatTimestamp(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
}

function Header({ product }) {
  const [shareCopied, setShareCopied] = useState(false)
  const { stats, isLoading: historyLoading } = useProductHistory(product?.url)

  const name = product?.product_name ?? 'Product name'
  const site = product?.site ?? 'Marketplace'
  const imageUrl = proxiedImageUrl(product?.image_url)

  // Prefer computed current price from history (reflects the latest
  // scrape); fall back to the product row's price if history hasn't
  // loaded yet or is empty.
  const currentPrice = stats?.currentPrice ?? product?.price

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 1500)
  }

  return (
    <section className={styles.header}>
      <div className={styles.imageArea}>
        {imageUrl ? (
          <img className={styles.image} src={imageUrl} alt={name} />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.badge}>{site}</span>
        <h1 className={styles.name}>{name}</h1>
        <p className={styles.price}>{formatPrice(currentPrice)}</p>

        {!historyLoading && (
          <dl className={styles.statGrid}>
            <div className={styles.stat}>
              <dt>Lowest</dt>
              <dd>{formatPrice(stats?.lowestPrice)}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Highest</dt>
              <dd>{formatPrice(stats?.highestPrice)}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Average</dt>
              <dd>{formatPrice(stats?.averagePrice)}</dd>
            </div>
          </dl>
        )}

        <p className={styles.scraped}>Last scraped {formatTimestamp(stats?.lastScrapedAt)}</p>

        <div className={styles.actions}>
          {product?.url && (
            <a className={styles.externalLink} href={product.url} target="_blank" rel="noreferrer">
              View on {site}
            </a>
          )}

          <button type="button" className={styles.trackButton} disabled title="Coming soon">
            Track Price
          </button>

          <button type="button" className={styles.shareButton} onClick={handleShare}>
            {shareCopied ? 'Link copied' : 'Share'}
          </button>
        </div>
      </div>
    </section>
  )
}

export default Header