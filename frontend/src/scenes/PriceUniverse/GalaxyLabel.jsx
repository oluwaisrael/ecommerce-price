import { Billboard, Html } from '@react-three/drei'
import styles from './GalaxyLabel.module.css'

/**
 * GalaxyLabel — floating name + product-count label above each
 * galaxy core (design reference panel 01: "JUMIA GALAXY — 48
 * products", colored to match that galaxy's tint). Purely
 * decorative/informational, no interaction.
 *
 * count comes from the real fetched node list (filtered by site) via
 * the caller — not hardcoded, so it stays accurate as products are
 * added/removed server-side.
 */
function GalaxyLabel({ center, site, count, color }) {
  const position = [center.x, 5.5, center.z]

  return (
    <Billboard position={position}>
      <Html center distanceFactor={22} occlude={false}>
        <div className={styles.label}>
          <span className={styles.name} style={{ color }}>
            {site.toUpperCase()} GALAXY
          </span>
          <span className={styles.count}>{count} products</span>
        </div>
      </Html>
    </Billboard>
  )
}

export default GalaxyLabel
