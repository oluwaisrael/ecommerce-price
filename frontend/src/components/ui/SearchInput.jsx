import styles from './SearchInput.module.css'

/**
 * SearchInput — same public API as before (value, onChange,
 * placeholder), so PriceUniverse's search-to-navigate and Hero's
 * usage are untouched. Visual-only additions: a search icon on the
 * left (matching the mockup's pill search bar) and a clear ("x")
 * button that appears once there's a value, calling the same
 * onChange callback with an empty string rather than introducing any
 * new prop/behavior contract.
 */
function SearchInput({ value, onChange, placeholder = 'Search a product or paste a Jumia/Jiji URL' }) {
  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />

      {value && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => onChange?.('')}
          aria-label="Clear search"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default SearchInput
