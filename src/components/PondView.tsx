import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { POND, type PlacedLotus, type TimeOfDay, lotusLabel } from '../lib/pond.ts'
import './PondView.css'

interface PondViewProps {
  lotuses: PlacedLotus[]
  /** A session to welcome: its lotus fades in and drifts to its spot. */
  arrivingId?: string
  emptyMessage: string
}

const TINTS: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night']
const HIT_RADIUS = 24 // 48px tap target, whatever the lotus size
const LOTUS_SIZE = 1.3 // drawing units -> pond units at full scale

/** A petal pointing up from (0, 0). */
function petal(length: number, width: number) {
  const w = width / 2
  return `M0 0C${w * 1.7} ${-length * 0.3} ${w * 1.1} ${-length * 0.8} 0 ${-length}C${-w * 1.1} ${-length * 0.8} ${-w * 1.7} ${-length * 0.3} 0 0Z`
}

const PETALS = [
  { angle: -55, d: petal(10, 7) },
  { angle: 55, d: petal(10, 7) },
  { angle: -28, d: petal(12, 7.5) },
  { angle: 28, d: petal(12, 7.5) },
  { angle: 0, d: petal(13.5, 8) },
]

// A round pad with the notch lily pads have, seen at an angle.
const PAD = 'M0 0L16.9 -0.6A17 6.5 0 1 1 15.4 -2.7Z'

function Petals({ fill, className }: { fill: string; className?: string }) {
  return (
    <g transform="translate(0 -1)" className={className}>
      {PETALS.map((p) => (
        <path key={p.angle} className="pond-petal" d={p.d} transform={`rotate(${p.angle})`} fill={fill} />
      ))}
    </g>
  )
}

function MiniLotus({ tint }: { tint: TimeOfDay }) {
  return (
    <g className="pond-mini">
      <path className="pond-pad" d={PAD} />
      <Petals fill={`url(#pond-tint-${tint})`} />
      {/* Cross-fades in on hover or keyboard focus. */}
      <Petals fill="url(#pond-tint-glow)" className="pond-petals-glow" />
    </g>
  )
}

/** Gentle irregular shoreline around the lotus area. */
function shorePath() {
  const points = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2
    const wobble = 1 + 0.018 * Math.sin(3 * a + 0.6) + 0.014 * Math.sin(5 * a + 2.1)
    return [POND.cx + (POND.rx + 24) * wobble * Math.cos(a), POND.cy + (POND.ry + 24) * wobble * Math.sin(a)]
  })
  // Closed Catmull-Rom curve through the points, as cubic Béziers.
  const at = (i: number) => points[(i + points.length) % points.length]
  let d = `M${at(0)[0].toFixed(1)} ${at(0)[1].toFixed(1)}`
  for (let i = 0; i < points.length; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return `${d}Z`
}
const SHORE = shorePath()

export default function PondView({ lotuses, arrivingId, emptyMessage }: PondViewProps) {
  // Draw back to front so nearer (lower) lotuses overlap farther ones.
  const ordered = [...lotuses].sort((a, b) => a.y - b.y)

  return (
    <div className="pond">
      <svg className="pond-svg" viewBox={`0 0 ${POND.width} ${POND.height}`} role="group" aria-label="Pond">
        <defs>
          <radialGradient id="pond-water" cx="50%" cy="42%" r="65%">
            <stop offset="0%" className="pond-water-a" />
            <stop offset="100%" className="pond-water-b" />
          </radialGradient>
          {TINTS.map((tint) => (
            <linearGradient key={tint} id={`pond-tint-${tint}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" className={`pond-tint-base pond-tint-base--${tint}`} />
              <stop offset="50%" className={`pond-tint-mid--${tint}`} />
              <stop offset="100%" className={`pond-tint-tip--${tint}`} />
            </linearGradient>
          ))}
          <linearGradient id="pond-tint-glow" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" className="pond-glow-base" />
            <stop offset="50%" className="pond-glow-mid" />
            <stop offset="100%" className="pond-glow-tip" />
          </linearGradient>
        </defs>

        <path className="pond-water" d={SHORE} fill="url(#pond-water)" />
        {/* A few still rings on the water. */}
        <g className="pond-rings" aria-hidden="true">
          <ellipse cx={POND.cx - 40} cy={POND.cy + 70} rx="46" ry="10" />
          <ellipse cx={POND.cx + 55} cy={POND.cy - 60} rx="36" ry="8" />
          <ellipse cx={POND.cx + 20} cy={POND.cy + 130} rx="30" ry="6" />
        </g>

        {ordered.map((lotus) => {
          const { session, x, y, scale, tint, drift } = lotus
          const driftStyle = {
            '--dx': `${drift.dx.toFixed(2)}px`,
            '--dy': `${drift.dy.toFixed(2)}px`,
            animationDuration: `${drift.seconds.toFixed(1)}s`,
            animationDelay: `${drift.delay.toFixed(1)}s`,
          } as CSSProperties
          return (
            <g key={session.id} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
              <g className={session.id === arrivingId ? 'pond-arrive' : undefined}>
                <g className="pond-drift" style={driftStyle}>
                  <Link to={`/history/${session.id}`} className="pond-lotus" aria-label={lotusLabel(lotus)}>
                    <circle className="pond-hit" r={HIT_RADIUS} cy={-4} />
                    <g transform={`scale(${(scale * LOTUS_SIZE).toFixed(3)})`}>
                      <MiniLotus tint={tint} />
                    </g>
                  </Link>
                </g>
              </g>
            </g>
          )
        })}
      </svg>

      {lotuses.length === 0 && <p className="pond-empty">{emptyMessage}</p>}
    </div>
  )
}
