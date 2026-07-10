import Navbar from './Navbar'
import styles from './PageShell.module.css'

function PageShell({ children }) {
  return (
    <div className={styles.shell}>
      <Navbar />
      <main className={styles.main}>{children}</main>
    </div>
  )
}

export default PageShell
