/**
 * Galaxy Layout Engine — Phase 2 of PriceUniverse.
 *
 * Scale note: constants below were increased ~5x from the original
 * pass (centers, spread, height range) so the two galaxies read as
 * distinct regions in a large navigable space rather than a small
 * cluster near the origin. NODE_RADIUS/BILLBOARD_MAX_DIM/camera
 * distances in ProductNode/ProductImage/CameraRig were scaled to
 * match — this file's numbers only make sense alongside those.
 *
 * Visual pass: nodes are placed on a two-armed logarithmic spiral
 * around each galaxy's center (classic "spiral galaxy" silhouette)
 * instead of scattered randomly in a disc. Distance-from-center,
 * angle-along-arm, and vertical scatter are all still deterministic
 * per-node (hashToUnit(node.id)), so layout is stable across
 * re-renders and re-fetches — same node always lands in the same
 * spot. Only the *shape* of the distribution changed; price still
 * drives height (y) exactly as before.
 */

const GALAXY_CENTERS = {
  Jumia: { x: -28, z: 0 },
  Jiji: { x: 28, z: 0 },
}
const DEFAULT_GALAXY_CENTER = { x: 0, z: 0 }

const MIN_HEIGHT = -2.5
const MAX_HEIGHT = 4.5

// Spiral shape. With ~66/15 real nodes per galaxy (sparse compared to
// a real star field), the radius/scatter here are deliberately small
// and tight so the few points available still trace a legible curve
// instead of reading as scattered clumps. GALAXY_RADIUS keeps the
// outermost arm well inside the ~64-unit gap between centers.
const GALAXY_RADIUS = 13
const CORE_RADIUS = 0.6
const ARM_COUNT = 2
const SPIRAL_TURNS = 0.85
const ARM_SCATTER = 0.35 // perpendicular jitter off the arm centerline
const VERTICAL_SCATTER = 0.35 // small y-jitter so the disc isn't perfectly flat

function hashToUnit(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16

  return (h >>> 0) / 4294967295
}

function galaxyCenter(site) {
  return GALAXY_CENTERS[site] ?? DEFAULT_GALAXY_CENTER
}

function priceToHeight(price, minPrice, maxPrice) {
  if (maxPrice <= minPrice) return (MIN_HEIGHT + MAX_HEIGHT) / 2

  const logMin = Math.log(Math.max(minPrice, 1))
  const logMax = Math.log(Math.max(maxPrice, 1))
  const logPrice = Math.log(Math.max(price, 1))

  const t = (logPrice - logMin) / (logMax - logMin)
  return MIN_HEIGHT + t * (MAX_HEIGHT - MIN_HEIGHT)
}

/**
 * Places a node on a logarithmic spiral: radius grows smoothly from
 * CORE_RADIUS to GALAXY_RADIUS as t (0–1, hashed from the node id)
 * increases, while the angle winds SPIRAL_TURNS times around. Nodes
 * are split evenly across ARM_COUNT arms (each arm offset by an even
 * fraction of a full turn), then given small perpendicular + radial
 * scatter so the arm reads as a dense band of stars rather than a
 * single perfect line.
 *
 * `index` (position within that site's node array) is folded into
 * every hash salt alongside `id`. Real scraped URLs can share long
 * substrings within a batch (tracking params, session ids), which
 * biased the hash output when `id` alone was hashed — folding in a
 * plain incrementing index guarantees clean, even spread regardless
 * of any structure in the underlying id string.
 */
function spiralPosition(id, index) {
  const tRadius = hashToUnit(`${index}-${id}-t`)
  const armPick = Math.floor(hashToUnit(`${index}-${id}-arm`) * ARM_COUNT)
  const armOffset = (armPick / ARM_COUNT) * Math.PI * 2

  // sqrt bias keeps density high near the core and thins toward the
  // rim, matching real spiral galaxies' brightness falloff.
  const radius = CORE_RADIUS + Math.sqrt(tRadius) * (GALAXY_RADIUS - CORE_RADIUS)
  const angle = armOffset + tRadius * SPIRAL_TURNS * Math.PI * 2

  const baseX = Math.cos(angle) * radius
  const baseZ = Math.sin(angle) * radius

  // Perpendicular scatter (across the arm) shrinks near the core so
  // the center reads as a tight, bright cluster rather than a blob.
  const scatterAmount = ARM_SCATTER * (0.3 + 0.7 * tRadius)
  const perpAngle = angle + Math.PI / 2
  const scatter = (hashToUnit(`${index}-${id}-s`) - 0.5) * 2 * scatterAmount

  const x = baseX + Math.cos(perpAngle) * scatter
  const z = baseZ + Math.sin(perpAngle) * scatter

  const yJitter = (hashToUnit(`${index}-${id}-y`) - 0.5) * 2 * VERTICAL_SCATTER

  return { x, z, yJitter }
}

export function computeGalaxyLayout(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) return []

  const prices = nodes.map((n) => n.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return nodes.map((node, index) => {
    const center = galaxyCenter(node.site)
    const height = priceToHeight(node.price, minPrice, maxPrice)
    const { x, z, yJitter } = spiralPosition(node.id, index)

    return {
      ...node,
      position: [center.x + x, height + yJitter, center.z + z],
    }
  })
}

// Exposed for the scene layer to render each galaxy's emissive core
// at the same centers this file uses, without duplicating the
// GALAXY_CENTERS constant.
export function getGalaxyCenters() {
  return GALAXY_CENTERS
}

/**
 * Generates a dense field of purely decorative "filler" star
 * positions tracing the same spiral shape as the real product nodes,
 * per galaxy. With only ~15-66 real products, the arm shape is too
 * sparse to read visually on its own — real spiral galaxy imagery
 * (and the design mockup) implies hundreds of points. This backfills
 * the silhouette with small, dim, non-interactive points; the actual
 * clickable product nodes render on top as the "featured" stars.
 *
 * Fully deterministic (seeded by site+index), computed once and
 * memoized by the caller — this is NOT meant to be recomputed on
 * every render.
 */
const FILLER_STARS_PER_GALAXY = 260

export function generateFillerStars() {
  const stars = []

  for (const site of Object.keys(GALAXY_CENTERS)) {
    const center = galaxyCenter(site)

    for (let i = 0; i < FILLER_STARS_PER_GALAXY; i++) {
      const seed = `filler-${site}-${i}`
      const { x, z, yJitter } = spiralPosition(seed, i)
      // Filler stars can sit slightly further out than real nodes to
      // soften the rim rather than cutting off sharply at GALAXY_RADIUS.
      const rimBias = hashToUnit(`${seed}-rim`)
      const rimStretch = 1 + rimBias * 0.4

      stars.push({
        key: seed,
        site,
        position: [
          center.x + x * rimStretch,
          yJitter * 1.4,
          center.z + z * rimStretch,
        ],
        // Slight size variance so the field doesn't look uniform/artificial.
        scale: 0.4 + hashToUnit(`${seed}-scale`) * 0.9,
      })
    }
  }

  return stars
}
