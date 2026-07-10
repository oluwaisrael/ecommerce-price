import styles from './CanvasPlaceholder.module.css'


function CanvasPlaceholder() {
  return (
    <div className={styles.placeholder}>
      <span className={styles.label}>3D scene mounts here</span>
    </div>
  )
}

export default CanvasPlaceholder
