import PriceUniverse from '../../scenes/PriceUniverse/PriceUniverse'
import SearchInput from '../ui/SearchInput'
import PopularSearches from './PopularSearches'
import StatsCards from './StatsCards'
import styles from './Hero.module.css'

function Hero({ searchValue, onSearchChange }) {
  return (
    <section className={styles.hero}>
      <div className={styles.sceneBackground}>
        <PriceUniverse searchValue={searchValue} />
      </div>

      <div className={styles.content}>
        <span className={styles.eyebrow}>Welcome to Derin's</span>
        <h1 className={styles.title}>
          Price
          <br />
          <span className={styles.titleAccent}>Intelligence</span>
        </h1>
        <p className={styles.subtitle}>
          Track prices across Jumia and Jiji.
          <br />
          Get notified when prices drop.
        </p>
        <SearchInput value={searchValue} onChange={onSearchChange} />

        {/* Popular Searches - Shows when search is empty */}
        {!searchValue && (
          <PopularSearches onSearchSelect={onSearchChange} />
        )}

        <StatsCards />
      </div>
    </section>
  )
}

export default Hero