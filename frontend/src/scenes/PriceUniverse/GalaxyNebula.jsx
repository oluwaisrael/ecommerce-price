import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * GalaxyNebula — a large, soft, additively-blended radial-gradient
 * sprite sitting behind a galaxy. Pure atmosphere/dust-cloud effect,
 * not a hittable object (no raycasting, no interaction). Built from
 * a canvas-generated radial gradient texture rather than a shader,
 * to keep this simple and dependency-free.
 */
function makeGradientTexture(colorHex) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  )

  const color = new THREE.Color(colorHex)
  const r = Math.round(color.r * 255)
  const g = Math.round(color.g * 255)
  const b = Math.round(color.b * 255)

  // Gradient pulled in much tighter to the center than before —
  // previously mid-stops still carried real opacity out near the
  // sprite edge, so two nebulas placed at the galaxy centers visually
  // merged into one blob with no black space between them. Now most
  // of the sprite's radius is fully transparent, with the visible
  // glow concentrated in the inner ~40%.
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.42)`)
  gradient.addColorStop(0.18, `rgba(${r}, ${g}, ${b}, 0.22)`)
  gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.06)`)
  gradient.addColorStop(0.65, `rgba(${r}, ${g}, ${b}, 0.015)`)
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// Default kept modest relative to GALAXY_RADIUS (13): at radius=17
// the sprite's visible glow (inner ~40% per the gradient above) caps
// out well within the ~28-unit half-gap between the two galaxy
// centers, leaving clear black space between them as in the mockup.
function GalaxyNebula({ center, color, radius = 12 }) {
  const texture = useMemo(() => makeGradientTexture(color), [color])

  return (
    <sprite
      position={[center.x, -0.3, center.z]}
      scale={[radius * 2, radius * 2, 1]}
      renderOrder={-1}
    >
      <spriteMaterial
        map={texture}
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  )
}

export default GalaxyNebula
