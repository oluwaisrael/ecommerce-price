import { Suspense, useState, useMemo, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useProducts } from '../../hooks/useProducts'
import { normalizeProducts } from './normalizeProducts'
import { computeGalaxyLayout, getGalaxyCenters, getGalaxyRadius } from './galaxyLayout'
import ProductNode from './ProductNode'
import GalaxyCore from './GalaxyCore'
import GalaxyStarfield from './GalaxyStarfield'
import GalaxyNebula from './GalaxyNebula'
import GalaxyOrbitRings from './GalaxyOrbitRings'
import GalaxyOrbitSatellites from './GalaxyOrbitSatellites'
import GalaxyLabel from './GalaxyLabel'
import CameraRig from './CameraRig'
import DetailPanel from './DetailPanel'
import styles from './PriceUniverse.module.css'

const SEARCH_DEBOUNCE_MS = 500

// Core colors intentionally match SITE_COLORS in normalizeProducts.js
// (Jumia orange, Jiji cyan) — kept as a local constant rather than
// importing normalizeProducts' internal map, since that map is
// per-node tint logic and this is scene-level galaxy dressing.
const GALAXY_CORE_COLORS = {
  Jumia: '#ff9900',
  Jiji: '#22e5e5',
}

/**
 * PriceUniverse — search-to-navigate.
 *
 * searchValue (from Hero's SearchInput, shared with Dashboard's list
 * filter) is debounced and matched against node names. A match
 * drives selectedId through the exact same path a click does, so
 * CameraRig flies to it identically. Search is NOT list-filtering
 * here — the scene always renders all nodes; only the camera moves.
 * Clearing the search (or no match) deselects, flying back to the
 * overview/drift state.
 */
function PriceUniverse({ searchValue = '' }) {
  const { data: rawProducts, isLoading, error } = useProducts()
  const [selectedId, setSelectedId] = useState(null)
  const debounceRef = useRef(null)

  const normalized = useMemo(() => normalizeProducts(rawProducts), [rawProducts])
  const nodes = useMemo(() => computeGalaxyLayout(normalized), [normalized])
  const galaxyCenters = useMemo(() => getGalaxyCenters(), [])
  const galaxyRadius = useMemo(() => getGalaxyRadius(), [])
  const siteCounts = useMemo(() => {
    const counts = {}
    for (const node of nodes) {
      counts[node.site] = (counts[node.site] ?? 0) + 1
    }
    return counts
  }, [nodes])
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      const query = searchValue.trim().toLowerCase()

      if (!query) {
        setSelectedId(null)
        return
      }

      const match = nodes.find((n) => n.name.toLowerCase().includes(query))
      setSelectedId(match ? match.id : null)
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(debounceRef.current)
  }, [searchValue, nodes])

  return (
    <div className={styles.canvasWrapper}>
      <Canvas
        camera={{ position: [0, 16, 58], fov: 50, far: 2000 }}
        onPointerMissed={() => setSelectedId(null)}
      >
        <color attach="background" args={['#03030a']} />
        {/* Fog falloff pushed slightly further out (40->46 near, 180->200
            far) — denser Stars below combined with the previous fog
            range made the outer starfield fade a bit too aggressively,
            flattening the sense of depth the mockup's dense background
            has. */}
        <fog attach="fog" args={['#03030a', 46, 200]} />

        {/* Cinematic lighting pass: ambientLight kept as the flat base
            fill (unchanged), hemisphereLight adds a subtle cool-top /
            warm-bottom gradient so unlit surfaces don't read as flat
            grey, and a second, dimmer point light gives the scene a
            soft secondary fill from the opposite side of the main
            light — without it everything on the far side of a node
            from the single original point light was fully unlit. */}
        <ambientLight intensity={0.3} />
        <hemisphereLight
          skyColor="#3a4a8f"
          groundColor="#0a0510"
          intensity={0.35}
        />
        <pointLight position={[0, 14, 0]} intensity={1.5} />
        <pointLight position={[-30, 8, 20]} intensity={0.4} color="#8899ff" />

        <Stars
          radius={220}
          depth={90}
          count={13000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />

        {Object.entries(galaxyCenters).map(([site, center]) => (
          <GalaxyNebula
            key={`nebula-${site}`}
            center={center}
            color={GALAXY_CORE_COLORS[site] ?? '#ffffff'}
            radius={galaxyRadius * 0.95}
          />
        ))}

        {Object.entries(galaxyCenters).map(([site, center]) => (
          <GalaxyOrbitRings
            key={`rings-${site}`}
            center={center}
            color={GALAXY_CORE_COLORS[site] ?? '#ffffff'}
            galaxyRadius={galaxyRadius}
          />
        ))}

        {Object.entries(galaxyCenters).map(([site, center]) => (
          <GalaxyOrbitSatellites
            key={`satellites-${site}`}
            center={center}
            color={GALAXY_CORE_COLORS[site] ?? '#ffffff'}
            galaxyRadius={galaxyRadius}
          />
        ))}

        {Object.entries(galaxyCenters).map(([site, center]) => (
          <GalaxyCore
            key={site}
            center={center}
            color={GALAXY_CORE_COLORS[site] ?? '#ffffff'}
          />
        ))}

        {Object.entries(galaxyCenters).map(([site, center]) => (
          <GalaxyLabel
            key={`label-${site}`}
            center={center}
            site={site}
            count={siteCounts[site] ?? 0}
            color={GALAXY_CORE_COLORS[site] ?? '#ffffff'}
          />
        ))}

        <GalaxyStarfield />

        <Suspense fallback={null}>
          {nodes.map((node) => (
            <ProductNode
              key={node.id}
              node={node}
              isSelected={node.id === selectedId}
              onSelect={(clicked) =>
                setSelectedId((current) =>
                  current === clicked.id ? null : clicked.id
                )
              }
            />
          ))}
        </Suspense>

        <CameraRig selectedNode={selectedNode} />

        <EffectComposer>
          <Bloom
            intensity={1.4}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      {isLoading && (
        <div className={styles.statusOverlay}>
          <div className={styles.statusCard}>
            <span className={styles.statusText}>Loading the universe...</span>
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className={styles.statusOverlay}>
          <div className={styles.statusCard}>
            <span className={styles.statusText}>Couldn't load products.</span>
            <span className={styles.statusSubtext}>{error}</span>
          </div>
        </div>
      )}

      <DetailPanel node={selectedNode} onClose={() => setSelectedId(null)} />
    </div>
  )
}

export default PriceUniverse
