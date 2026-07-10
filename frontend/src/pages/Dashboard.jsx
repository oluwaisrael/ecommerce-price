import { useState } from 'react'
import PageShell from '../components/layout/PageShell'
import Hero from '../components/hero/Hero'
import ProductList from '../components/product/ProductList'
import styles from './Dashboard.module.css'

function Dashboard() {
  const [search, setSearch] = useState('')

  const products = []
  const isLoading = false
  const error = null

  return (
    <PageShell>
      <Hero searchValue={search} onSearchChange={setSearch} />
      <section id="products" className={styles.productsSection}>
        <ProductList
          products={products}
          isLoading={isLoading}
          error={error}
          onRetry={() => {}}
        />
      </section>
    </PageShell>
  )
}

export default Dashboard
