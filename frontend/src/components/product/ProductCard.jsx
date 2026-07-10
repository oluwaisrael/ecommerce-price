import styles from './ProductCard.module.css'

// Structure only for now — field names will be finalized in Phase 3
// once this is wired to GET /api/products.
function ProductCard({ product }) {
  return (
    <article className={styles.card}>
      <div className={styles.imageArea} />
      <div className={styles.body}>
        <h3 className={styles.name}>{product?.name ?? 'Product name'}</h3>
        <p className={styles.price}>{product?.price ?? '—'}</p>
        <span className={styles.source}>{product?.source ?? 'Source'}</span>
      </div>
    </article>
  )
}

export default ProductCard
