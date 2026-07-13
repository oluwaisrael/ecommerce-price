/**
 * Galaxy Layout Engine — Phase 2 of PriceUniverse.
 *
 * Scale note: constants below were increased ~5x from the original
 * pass (centers, spread, height range) so the two galaxies read as
 * distinct regions in a large navigable space rather than a small
 * cluster near the origin. NODE_RADIUS/BILLBOARD_MAX_DIM/camera
 * distances in ProductNode/ProductImage/CameraRig were scaled to
 * match — this file's numbers only make sense alongside those.
 */

const GALAXY_CENTERS = {
  Jumia: { x: -65, z: 0 },
  Jiji: { x: 65, z: 0 },
}
const DEFAULT_GALAXY_CENTER = { x: 0, z: 0 }

const MIN_HEIGHT = 2
const MAX_HEIGHT = 55
const SPREAD_RADIUS = 24

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

export function computeGalaxyLayout(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) return []

  const prices = nodes.map((n) => n.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return nodes.map((node) => {
    const center = galaxyCenter(node.site)
    const y = priceToHeight(node.price, minPrice, maxPrice)

    const jitterX = (hashToUnit(`${node.id}-x`) - 0.5) * 2 * SPREAD_RADIUS
    const jitterZ = (hashToUnit(`${node.id}-z`) - 0.5) * 2 * SPREAD_RADIUS

    return {
      ...node,
      position: [center.x + jitterX, y, center.z + jitterZ],
    }
  })
}
