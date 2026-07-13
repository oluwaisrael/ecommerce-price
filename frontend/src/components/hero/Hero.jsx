import PriceUniverse from '../../scenes/PriceUniverse/PriceUniverse'
import SearchInput from '../ui/SearchInput'
import styles from './Hero.module.css'

function Hero({ searchValue, onSearchChange }) {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>Track prices across Jumia and Jiji</h1>
        <p className={styles.subtitle}>
          Search a product to see its price history and get notified when it drops.
        </p>
        <SearchInput value={searchValue} onChange={onSearchChange} />
      </div>
      <div className={styles.canvasArea}>
        <PriceUniverse searchValue={searchValue} />
      </div>
    </section>
  )
}

export default Hero
