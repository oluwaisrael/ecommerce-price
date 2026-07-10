import styles from './LoadingState.module.css'

function LoadingState({ message = 'Loading products…' }) {
  return (
    <div className={styles.loading} role="status">
      <span>{message}</span>
    </div>
  )
}

export default LoadingState
