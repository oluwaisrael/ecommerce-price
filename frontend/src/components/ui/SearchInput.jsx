import styles from './SearchInput.module.css'

function SearchInput({ value, onChange, placeholder = 'Search a product or paste a Jumia/Jiji URL' }) {
  return (
    <input
      type="text"
      className={styles.input}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}

export default SearchInput
