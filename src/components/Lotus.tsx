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
const WATER = { cy: 160, rx: 98, ry: 30 }

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
        viewBox={onWater ? "0 52 200 150" : "0 52 200 114"}
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
              <clipPath id={`${uid}-pool`}>
                <ellipse cx={BASE.x} cy={WATER.cy} rx={WATER.rx} ry={WATER.ry} />
              </clipPath>
              <linearGradient id={`${uid}-fade-g`} x1="0" y1={BASE.y} x2="0" y2={BASE.y + 40} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <mask id={`${uid}-fade`} maskUnits="userSpaceOnUse" x="0" y={BASE.y} width="200" height="60">
                <rect x="0" y={BASE.y} width="200" height="60" fill={`url(#${uid}-fade-g)`} />
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
            {[0, 1].map((i) => (
              <ellipse key={i} className="lotus-ripple lotus-ripple--calm" cx={BASE.x} cy={BASE.y + 2} rx="44" ry="5" />
            ))}
          </g>
        )}

        <g className={rise ? 'lotus-riser' : undefined}>{flower}</g>
      </svg>
    </div>
  )
}
