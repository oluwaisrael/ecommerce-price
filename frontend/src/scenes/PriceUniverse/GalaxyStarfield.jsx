import { useMemo } from 'react'
import * as THREE from 'three'
import { generateFillerStars } from './galaxyLayout'

const SITE_COLORS = {
  Jumia: '#ff9900',
  Jiji: '#22e5e5',
}

/**
 * GalaxyStarfield — dense, purely decorative filler points tracing
 * the same spiral arms as the real product nodes. Rendered as a
 * single THREE.Points cloud per galaxy (not individual meshes) so a
 * few hundred extra points cost almost nothing — no interaction, no
 * per-star React reconciliation.
 *
 * generateFillerStars() is deterministic and has no dependency on
 * fetched data, so it's computed once via useMemo with an empty dep
 * array rather than on every render.
 */
function GalaxyStarfield() {
  const { positions, colors } = useMemo(() => {
    const stars = generateFillerStars()
    const positions = new Float32Array(stars.length * 3)
    const colors = new Float32Array(stars.length * 3)
    const color = new THREE.Color()

    stars.forEach((star, i) => {
      positions[i * 3] = star.position[0]
      positions[i * 3 + 1] = star.position[1]
      positions[i * 3 + 2] = star.position[2]

      color.set(SITE_COLORS[star.site] ?? '#ffffff')
      // Dim + slightly vary brightness per star via scale so the
      // field doesn't look like a flat, uniform texture.
      const brightness = 0.35 + star.scale * 0.25
      colors[i * 3] = color.r * brightness
      colors[i * 3 + 1] = color.g * brightness
      colors[i * 3 + 2] = color.b * brightness
    })

    return { positions, colors }
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.22}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  )
}

export default GalaxyStarfield
