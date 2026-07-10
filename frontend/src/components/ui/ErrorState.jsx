import styles from './ErrorState.module.css'

function ErrorState({ message = 'Something went wrong loading products.', onRetry }) {
  return (
    <div className={styles.error} role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export default ErrorState
