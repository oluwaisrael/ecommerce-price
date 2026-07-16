import { Suspense, useMemo, useRef } from 'react'
import { Billboard, Html, useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import ImageErrorBoundary from './ImageErrorBoundary'

const NODE_RADIUS = 0.5
const BILLBOARD_MAX_DIM = 1.1
const FORWARD_OFFSET = NODE_RADIUS + 0.4

const NARROW_ASPECT_BREAKPOINT = 0.7
const MIN_SCALE = 0.45

// Price-driven sizing: higher-priced products render as a visibly
// larger card, within a modest range so cheap items never disappear
// and expensive ones never dominate the scene. priceScale is a plain
// 0..1 already computed by ProductNode from the node's price relative
// to that galaxy's min/max — this file just maps it onto a visual
// multiplier.
const MIN_PRICE_SCALE = 0.82
const MAX_PRICE_SCALE = 1.35

function getResponsiveMaxDim(aspect) {
  if (aspect >= NARROW_ASPECT_BREAKPOINT) return BILLBOARD_MAX_DIM
  const t = Math.max(aspect / NARROW_ASPECT_BREAKPOINT, 0)
  const scale = MIN_SCALE + (1 - MIN_SCALE) * t
  return BILLBOARD_MAX_DIM * scale
}

// Frame padding + glow sizing, relative to the image plane's own
// dimensions rather than fixed units, so the frame scales correctly
// for both wide and narrow (responsive) images. Previous values
// (0.16 / 0.5) against a ~1.1-unit plane produced a border only a
// few pixels wide at the ~58-unit default camera distance — visible
// in a close-up but not at overview scale, which is why the frame
// wasn't reading as a "framed card" like the mockup. Padding roughly
// doubled/tripled here.
const FRAME_PADDING = 0.32
const GLOW_PADDING = 0.85

/**
 * CardFrame — the glow + border + backing chrome shared by both the
 * real product image and the fallback initial-letter card, so hover
 * pulse and price-scale behave identically whether or not the image
 * loaded. `children` renders the innermost content plane.
 */
function CardFrame({ frameColor, planeWidth, planeHeight, isHovered, children }) {
  const glowRef = useRef()

  const frameWidth = planeWidth + FRAME_PADDING * 2
  const frameHeight = planeHeight + FRAME_PADDING * 2
  const glowWidth = planeWidth + GLOW_PADDING * 2
  const glowHeight = planeHeight + GLOW_PADDING * 2

  // Soft pulse on hover: glow scale/opacity breathes instead of
  // snapping, via a sine wave gated by isHovered — no state changes
  // per frame, just ref mutation, so this is cheap even with many
  // nodes mounted at once.
  useFrame((state) => {
    if (!glowRef.current) return
    if (isHovered) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.5 + 0.5
      glowRef.current.scale.setScalar(1 + pulse * 0.18)
      if (glowRef.current.material) {
        glowRef.current.material.opacity = 0.55 + pulse * 0.25
      }
    } else {
      glowRef.current.scale.setScalar(
        glowRef.current.scale.x + (1 - glowRef.current.scale.x) * 0.15
      )
      if (glowRef.current.material) {
        const mat = glowRef.current.material
        mat.opacity += (0.55 - mat.opacity) * 0.15
      }
    }
  })

  return (
    <group>
      {/* Soft outer glow — additive, blurred-looking via low opacity
          + oversized bounds, sits behind everything else. This is what
          reads as "glowing" rather than a flat rectangle. Pulses on
          hover via the useFrame above. */}
      <mesh ref={glowRef} renderOrder={-1} position={[0, 0, -0.02]}>
        <planeGeometry args={[glowWidth, glowHeight]} />
        <meshBasicMaterial
          color={frameColor}
          transparent
          opacity={0.55}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Card frame — thin marketplace-colored border behind the
          image, giving the "framed card" look from the mockup. */}
      <mesh renderOrder={0} position={[0, 0, -0.01]}>
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshBasicMaterial
          color={frameColor}
          transparent
          opacity={0.9}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Dark backing so the frame border is actually visible as a
          border rather than being fully covered by the image. */}
      <mesh renderOrder={0} position={[0, 0, -0.005]}>
        <planeGeometry args={[planeWidth + FRAME_PADDING * 0.6, planeHeight + FRAME_PADDING * 0.6]} />
        <meshBasicMaterial color="#05050c" toneMapped={false} depthWrite={false} />
      </mesh>

      {children}
    </group>
  )
}

function Texture({ url, frameColor, planeWidth, planeHeight, isHovered }) {
  const texture = useTexture(url)

  return (
    <CardFrame
      frameColor={frameColor}
      planeWidth={planeWidth}
      planeHeight={planeHeight}
      isHovered={isHovered}
    >
      <mesh renderOrder={1}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial
          map={texture}
          transparent
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </CardFrame>
  )
}

/**
 * FallbackCard — shown when a product has no image URL, or when the
 * image fails to load (404 / CORS / proxy timeout — this was
 * previously silently rendering nothing, which is why some Jumia
 * products with broken proxied URLs showed no card at all while their
 * sibling Jiji products, whose images happened to load, looked fine).
 * Renders the same CardFrame chrome (glow/border/backing/hover-pulse)
 * so a broken-image product still reads as a real card in the galaxy,
 * with the product's first initial and marketplace color standing in
 * for the missing thumbnail.
 */
function FallbackCard({ frameColor, planeWidth, planeHeight, isHovered, initial }) {
  return (
    <CardFrame
      frameColor={frameColor}
      planeWidth={planeWidth}
      planeHeight={planeHeight}
      isHovered={isHovered}
    >
      <mesh renderOrder={1}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial color={frameColor} transparent opacity={0.35} toneMapped={false} depthWrite={false} />
      </mesh>
      {/* No canvas-texture dependency for the letter — a simple HTML
          overlay (same pattern GalaxyLabel/ProductNode's hover card
          already use via drei's Html) centered on the card, styled
          inline so this file stays self-contained. distanceFactor
          keeps it screen-space-consistent with everything else that
          uses Html in this scene. */}
      <Html center distanceFactor={10} occlude={false} renderOrder={2}>
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 700,
            fontSize: '22px',
            color: frameColor,
            textShadow: `0 0 12px ${frameColor}`,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {initial}
        </div>
      </Html>
    </CardFrame>
  )
}

function ProductImage({ url, position, color = '#ffffff', name = '', priceScale = 0.5, isHovered = false }) {
  const billboardPosition = [
    position[0],
    position[1],
    position[2] + FORWARD_OFFSET,
  ]

  const { size } = useThree()
  const aspectRatio = size.width / size.height
  const maxDim = getResponsiveMaxDim(aspectRatio)

  // Map priceScale (0..1) onto a visual multiplier, then apply to the
  // default 1:1 (square-ish) fallback plane. Real images set their own
  // aspect-correct plane dims inside Texture and get this same
  // multiplier applied via the group scale below, so both the real
  // image and fallback card size consistently with price.
  const sizeMultiplier = useMemo(
    () => MIN_PRICE_SCALE + priceScale * (MAX_PRICE_SCALE - MIN_PRICE_SCALE),
    [priceScale]
  )

  const initial = (name?.trim?.()[0] ?? '?').toUpperCase()

  return (
    <Billboard position={billboardPosition}>
      <group scale={sizeMultiplier}>
        {url ? (
          <ImageErrorBoundary
            fallback={
              <FallbackCard
                frameColor={color}
                planeWidth={maxDim}
                planeHeight={maxDim}
                isHovered={isHovered}
                initial={initial}
              />
            }
          >
            <Suspense
              fallback={
                <FallbackCard
                  frameColor={color}
                  planeWidth={maxDim}
                  planeHeight={maxDim}
                  isHovered={isHovered}
                  initial={initial}
                />
              }
            >
              <Texture
                url={url}
                frameColor={color}
                planeWidth={maxDim}
                planeHeight={maxDim}
                isHovered={isHovered}
              />
            </Suspense>
          </ImageErrorBoundary>
        ) : (
          <FallbackCard
            frameColor={color}
            planeWidth={maxDim}
            planeHeight={maxDim}
            isHovered={isHovered}
            initial={initial}
          />
        )}
      </group>
    </Billboard>
  )
}

export default ProductImage
