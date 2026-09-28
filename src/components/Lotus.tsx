import { type CSSProperties, useEffect, useId, useState } from 'react'
import './Lotus.css'

/** 0 = closed bud, 1–4 = that many outer layers open, 'bloom' = fully open. */
export type LotusStage = 0 | 1 | 2 | 3 | 4 | 'bloom'

interface LotusProps {
  stage: LotusStage
  /** Soft glow behind the lotus that expands (~4s) and contracts (~6s). */
  breathing?: boolean
  /** Sit on still water with a soft reflection and the odd slow ripple (Home). */
  onWater?: boolean
  /** Rise gently out of the water as it fades in (once, when the app opens). */
  rise?: boolean
}

// Side view: every petal grows up from the same base point and rotates
// outward around it. Layers are listed inner to outer.
const BASE = { x: 100, y: 150 }
const CLOSED_ANGLE = 5
// Still water around the base, used on Home.
const WATER = { cy: 166, rx: 128, ry: 38 }

/** A round lotus leaf seen at an angle, with the notch real ones have. */
function leafPath(rx: number, ry: number) {
  return `M0 0L${rx * 0.995} ${-ry * 0.09}A${rx} ${ry} 0 1 1 ${rx * 0.9} ${-ry * 0.42}Z`
}

/** Faint veins running out from the leaf's centre. */
function leafVeins(rx: number, ry: number) {
  return [200, 235, 270, 305, 340, 160, 125, 90, 55]
    .map((deg) => {
      const a = (deg * Math.PI) / 180
      return `M0 0L${(rx * 0.86 * Math.cos(a)).toFixed(1)} ${(ry * 0.86 * Math.sin(a)).toFixed(1)}`
    })
    .join('')
}

// The pond around the Home lotus: big leaves, buds on stems, small pads.
const LEAVES = [
  { x: 176, y: 158, rx: 30, ry: 8, flip: true },
  { x: 36, y: 180, rx: 40, ry: 12, flip: false },
  { x: 150, y: 190, rx: 22, ry: 6, flip: false },
]
const RAISED_LEAF = { x: 22, y: 118, rx: 26, ry: 10, tilt: -22, stemFrom: 160 }
const BUDS = [
  { x: 186, top: 104, from: 162, size: 1 },
  { x: -8, top: 128, from: 168, size: 0.8 },
]
const PADS = [
  [60, 150, 7, 2],
  [140, 146, 5, 1.5],
  [212, 172, 8, 2.2],
  [-14, 158, 6, 1.8],
  [92, 196, 6, 1.6],
  [118, 176, 4, 1.2],
  [4, 196, 5, 1.4],
  [224, 190, 5, 1.4],
] as const

function Leaf({ rx, ry, fill }: { rx: number; ry: number; fill: string }) {
  return (
    <g className="lotus-leaf">
      <path d={leafPath(rx, ry)} fill={fill} className="lotus-leaf-shape" />
      <path d={leafVeins(rx, ry)} className="lotus-leaf-veins" />
    </g>
  )
}

function PondBack({ uid }: { uid: string }) {
  const fill = `url(#${uid}-leaf)`
  return (
    <g className="lotus-pond" aria-hidden="true">
      {PADS.map(([x, y, rx, ry]) => (
        <ellipse key={`${x}-${y}`} className="lotus-pad-small" cx={x} cy={y} rx={rx} ry={ry} />
      ))}
      <path className="lotus-stem" d={`M${RAISED_LEAF.x + 2} ${RAISED_LEAF.stemFrom}Q${RAISED_LEAF.x - 4} 140 ${RAISED_LEAF.x} ${RAISED_LEAF.y}`} />
      <g transform={`translate(${RAISED_LEAF.x} ${RAISED_LEAF.y}) rotate(${RAISED_LEAF.tilt})`}>
        <Leaf rx={RAISED_LEAF.rx} ry={RAISED_LEAF.ry} fill={fill} />
      </g>
      {BUDS.map((bud) => (
        <g key={bud.x} className="lotus-bud-sway" style={{ transformOrigin: `${bud.x}px ${bud.from}px` }}>
          <path className="lotus-stem" d={`M${bud.x} ${bud.from}Q${bud.x + 3} ${(bud.from + bud.top) / 2} ${bud.x} ${bud.top}`} />
          <path
            className="lotus-petal-shape"
            transform={`translate(${bud.x} ${bud.top + 1})`}
            d={petalPath(20 * bud.size, 15 * bud.size)}
            fill={`url(#${uid}-bud)`}
          />
        </g>
      ))}
      <g transform={`translate(${LEAVES[0].x} ${LEAVES[0].y}) scale(-1 1)`}>
        <Leaf rx={LEAVES[0].rx} ry={LEAVES[0].ry} fill={fill} />
      </g>
    </g>
  )
}

function PondFront({ uid }: { uid: string }) {
  return (
    <g className="lotus-pond" aria-hidden="true">
      {LEAVES.slice(1).map((leaf) => (
        <g key={leaf.x} transform={`translate(${leaf.x} ${leaf.y})${leaf.flip ? ' scale(-1 1)' : ''}`}>
          <Leaf rx={leaf.rx} ry={leaf.ry} fill={`url(#${uid}-leaf)`} />
        </g>
      ))}
    </g>
  )
}

const LAYERS = [
  { angle: 28, length: 68, width: 24, tone: 'l1' },
  { angle: 46, length: 64, width: 25, tone: 'l2' },
  { angle: 64, length: 58, width: 25, tone: 'l3' },
  { angle: 82, length: 50, width: 23, tone: 'l4' },
] as const

const BUD = [
  { angle: -10, length: 66, width: 22 },
  { angle: 10, length: 66, width: 22 },
  { angle: 0, length: 72, width: 24 },
] as const

/** A petal pointing straight up with its base at (0, 0): full body, fine tip. */
function petalPath(length: number, width: number) {
  const w = width / 2
  return [
    'M 0 0',
    `C ${w * 1.8} ${-length * 0.24}, ${w * 0.8} ${-length * 0.84}, 0 ${-length}`,
    `C ${-w * 0.8} ${-length * 0.84}, ${-w * 1.8} ${-length * 0.24}, 0 0`,
    'Z',
  ].join(' ')
}

/** A soft highlight down the middle and two faint side veins. */
function veinPaths(length: number, width: number) {
  const w = width / 2
  return {
    mid: `M 0 ${-length * 0.06} Q ${w * 0.06} ${-length * 0.45} 0 ${-length * 0.78}`,
    sides: [1, -1]
      .map((s) => `M 0 ${-length * 0.08} Q ${s * w * 0.7} ${-length * 0.4} ${s * w * 0.3} ${-length * 0.72}`)
      .join(' '),
  }
}

interface PetalProps {
  length: number
  width: number
  fill: string
  className: string
  style: CSSProperties
}

/** One petal: its shape and veins, rotated together around the base. */
function Petal({ length, width, fill, className, style }: PetalProps) {
  const veins = veinPaths(length, width)
  return (
    <g className={className} style={style}>
      <path className="lotus-petal-shape" d={petalPath(length, width)} fill={fill} />
      <path className="lotus-vein" d={veins.sides} />
      <path className="lotus-vein lotus-vein--mid" d={veins.mid} />
    </g>
  )
}

export default function Lotus({ stage, breathing = true, onWater = false, rise = false }: LotusProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  // Always mount closed, then move to the requested stage on the next
  // frames so the petals visibly open instead of appearing already open.
  const [shown, setShown] = useState<LotusStage>(0)
  useEffect(() => {
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setShown(stage))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [stage])

  const bloom = shown === 'bloom'
  const openLayers = bloom ? LAYERS.length : shown

  const flower = (
    <g className="lotus-flower">
      {[...LAYERS].reverse().map((layer, i) => {
        const layerNumber = LAYERS.length - i
        const open = layerNumber <= openLayers
        const angle = open ? layer.angle * (bloom ? 1.06 : 1) : CLOSED_ANGLE
        return (
          <g key={layerNumber} transform={`translate(${BASE.x} ${BASE.y})`}>
            {[-1, 1].map((side) => (
              <Petal
                key={side}
                className={`lotus-petal${open ? ' is-open' : ''}`}
                length={layer.length}
                width={layer.width}
                fill={`url(#${uid}-${layer.tone})`}
                style={{ transform: `rotate(${side * angle}deg) scale(${open ? 1 : 0.9})` }}
              />
            ))}
          </g>
        )
      })}

      <g transform={`translate(${BASE.x} ${BASE.y})`}>
        {BUD.map((petal) => (
          <Petal
            key={petal.angle}
            className="lotus-petal lotus-petal--bud"
            length={petal.length}
            width={petal.width}
            fill={`url(#${uid}-bud)`}
            style={{ transform: `rotate(${petal.angle * (openLayers > 0 ? 1.4 : 1)}deg)` }}
          />
        ))}
      </g>
    </g>
  )

  return (
    <div className={`lotus${bloom ? ' lotus--bloom' : ''}${onWater ? ' lotus--water' : ''}${rise ? ' lotus--rise' : ''}`}>
      {breathing && <div className="lotus-glow" aria-hidden="true" />}
      <svg
        className="lotus-svg"
        viewBox={onWater ? "-30 40 260 172" : "0 52 200 114"}
        role="img"
        aria-label={bloom ? 'A lotus in full bloom' : `A lotus, ${openLayers} of 4 layers open`}
      >
        <defs>
          {(['bud', 'l1', 'l2', 'l3', 'l4'] as const).map((tone) => (
            <linearGradient key={tone} id={`${uid}-${tone}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" className="stop-base" />
              <stop offset="28%" className="stop-cream" />
              <stop offset="70%" className={`stop-mid--${tone}`} />
              <stop offset="100%" className={`stop-tip--${tone}`} />
            </linearGradient>
          ))}
          {onWater && (
            <>
              <radialGradient id={`${uid}-water`} cx="50%" cy="40%" r="50%">
                <stop offset="0%" className="lotus-water-a" />
                <stop offset="70%" className="lotus-water-b" />
                <stop offset="100%" className="lotus-water-b" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`${uid}-leaf`} cx="45%" cy="40%" r="65%">
                <stop offset="0%" className="lotus-leaf-a" />
                <stop offset="100%" className="lotus-leaf-b" />
              </radialGradient>
              <clipPath id={`${uid}-pool`}>
                <ellipse cx={BASE.x} cy={WATER.cy} rx={WATER.rx} ry={WATER.ry} />
              </clipPath>
              <linearGradient id={`${uid}-fade-g`} x1="0" y1={BASE.y} x2="0" y2={BASE.y + 40} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <mask id={`${uid}-fade`} maskUnits="userSpaceOnUse" x="-30" y={BASE.y} width="260" height="60">
                <rect x="-30" y={BASE.y} width="260" height="60" fill={`url(#${uid}-fade-g)`} />
              </mask>
            </>
          )}
        </defs>

        {!onWater && <ellipse className="lotus-pad" cx={BASE.x} cy={BASE.y + 6} rx="58" ry="7" />}
        {bloom && (
          <g aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <ellipse key={i} className="lotus-ripple" cx={BASE.x} cy={BASE.y + 6} rx="58" ry="7" />
            ))}
          </g>
        )}

        {onWater && (
          <g className="lotus-water-layer" aria-hidden="true">
            <ellipse cx={BASE.x} cy={WATER.cy} rx={WATER.rx} ry={WATER.ry} fill={`url(#${uid}-water)`} />
            {/* The reflection: the same flower, mirrored at the waterline, squashed and fading. */}
            <g clipPath={`url(#${uid}-pool)`} mask={`url(#${uid}-fade)`} className="lotus-reflection">
              <g transform={`matrix(1 0 0 -0.55 0 ${BASE.y * 1.55})`}>{flower}</g>
            </g>
            {/* Soft light on the water. */}
            <g className="lotus-shimmer">
              <ellipse cx={40} cy={170} rx={26} ry={1.2} />
              <ellipse cx={160} cy={180} rx={34} ry={1.4} />
              <ellipse cx={110} cy={194} rx={20} ry={1} />
            </g>
            {[0, 1].map((i) => (
              <ellipse key={i} className="lotus-ripple lotus-ripple--calm" cx={BASE.x} cy={BASE.y + 2} rx="44" ry="5" />
            ))}
            <PondBack uid={uid} />
          </g>
        )}

        <g className={rise ? 'lotus-riser' : undefined}>
          <g className="lotus-float">{flower}</g>
        </g>
        {onWater && <PondFront uid={uid} />}
      </svg>
    </div>
  )
}
