import ProductCard from './ProductCard'
import LoadingState from '../ui/LoadingState'
import ErrorState from '../ui/ErrorState'
import styles from './ProductList.module.css'

// Structure only: products/isLoading/error/onRetry are plain props for
// now so this renders correctly with no data source wired up. Phase 3
// swaps the caller (Dashboard) to pass real values from useProducts().
function ProductList({ products = [], isLoading = false, error = null, onRetry }) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <span>No products yet. Search above to get started.</span>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id ?? product.url} product={product} />
      ))}
    </div>
  )
}

export default ProductList
