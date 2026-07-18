import { useNavigate } from 'react-router-dom'
import { BASE_URL } from '../../api/client'
import styles from './ProductCard.module.css'

// Field names match GET /api/products response: product_name, price
// (integer naira), url, site, category.
function formatPrice(price) {
  if (typeof price !== 'number') return '—'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price)
}

// Jumia/Jiji CDN images block direct browser fetches (hotlink/CORS
// protection) — route through the backend's server-to-server proxy
// instead, same as the PriceUniverse 3D scene does.
function proxiedImageUrl(imageUrl) {
  if (!imageUrl) return null
  return `${BASE_URL}/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
}

// Whole card navigates to the detail page. The dashboard never links
// out to Jumia/Jiji directly anymore — that link now lives only on
// the detail page, which is the single source of truth for a product.
function ProductCard({ product }) {
  const navigate = useNavigate()
  const name = product?.product_name ?? 'Product name'
  const price = formatPrice(product?.price)
  const site = product?.site ?? 'Source'
  const imageUrl = proxiedImageUrl(product?.image_url)

  function goToDetail() {
    if (!product?.url) return
    navigate(`/product/${encodeURIComponent(product.url)}`)
  }

  return (
    <article
      className={styles.card}
      onClick={goToDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          goToDetail()
        }
      }}
    >
      {imageUrl ? (
        <img className={styles.image} src={imageUrl} alt={name} />
      ) : (
        <div className={styles.imageArea} />
      )}
      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.price}>{price}</p>
        <span className={styles.source}>{site}</span>
      </div>
    </article>
  )
}

export default ProductCard