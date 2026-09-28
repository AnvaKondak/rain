import type { Session } from '../db/types.ts'
import { formatDay } from './dates.ts'

// Where each session's lotus floats. Everything derives from the session ID
// (a seeded random function), so a lotus always appears in the same spot and
// nothing needs storing.

/** Pond drawing size, in SVG units (roughly CSS px at phone width). */
export const POND = { width: 340, height: 400, cx: 170, cy: 202, rx: 138, ry: 162 }

const BASE_GAP = 56 // minimum distance between lotus centres at full size
const CROWDED_AFTER = 30

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

export function timeOfDay(iso: string): TimeOfDay {
  const hour = new Date(iso).getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

/** A 32-bit hash of a string (FNV-1a). */
function hash(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** mulberry32: a small, fast seeded random generator returning [0, 1). */
function seeded(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface PlacedLotus {
  session: Session
  x: number
  y: number
  /** 1 for a full session at normal density; smaller when ended early or crowded. */
  scale: number
  tint: TimeOfDay
  drift: { dx: number; dy: number; seconds: number; delay: number }
}

/**
 * Place a month's sessions on the pond. Sessions are placed oldest first,
 * each at the first spot its seed gives that keeps a minimum gap from those
 * already placed, so adding a new session never moves the older ones.
 */
export function layoutPond(sessions: Session[]): PlacedLotus[] {
  const ordered = [...sessions].sort((a, b) => a.startedAt.localeCompare(b.startedAt))
  // Many sessions: shrink everything a little so the pond stays calm.
  const crowd = ordered.length > CROWDED_AFTER ? Math.max(0.62, Math.sqrt(CROWDED_AFTER / ordered.length)) : 1
  const gap = BASE_GAP * crowd
  const placed: PlacedLotus[] = []

  for (const session of ordered) {
    const random = seeded(hash(session.id))
    let best = { x: POND.cx, y: POND.cy, clearance: -1 }
    for (let attempt = 0; attempt < 30; attempt++) {
      // Uniform over an ellipse inset from the shore.
      const r = Math.sqrt(random())
      const angle = random() * Math.PI * 2
      const x = POND.cx + r * POND.rx * Math.cos(angle)
      const y = POND.cy + r * POND.ry * Math.sin(angle)
      const clearance = Math.min(Infinity, ...placed.map((p) => Math.hypot(p.x - x, p.y - y)))
      if (clearance > best.clearance) best = { x, y, clearance }
      if (clearance >= gap) break // first spot that fits: stable for this ID
    }

    const seconds = 10 + random() * 8
    placed.push({
      session,
      x: best.x,
      y: best.y,
      scale: crowd * (session.completedAt ? 1 : 0.8),
      tint: timeOfDay(session.startedAt),
      drift: {
        dx: (random() - 0.5) * 6,
        dy: (random() - 0.5) * 4,
        seconds,
        delay: -random() * seconds, // start mid-loop so they don't move in unison
      },
    })
  }
  return placed
}

/** "2026-09" style key for the month an ISO timestamp falls in, local time. */
export function monthKey(iso: string | Date): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Every month key from `first` to `last` inclusive. */
export function monthRange(first: string, last: string): string[] {
  const [y0, m0] = first.split('-').map(Number)
  const keys: string[] = []
  for (let y = y0, m = m0; ; m++) {
    if (m > 12) {
      y++
      m = 1
    }
    const key = `${y}-${String(m).padStart(2, '0')}`
    keys.push(key)
    if (key >= last) break
  }
  return keys
}

const monthFormat = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })
export function formatMonth(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return monthFormat.format(new Date(y, m - 1, 1))
}

/** Screen reader label, e.g. "Meditation on Sun, Sep 27, afternoon, anxious." */
export function lotusLabel({ session, tint }: Pick<PlacedLotus, 'session' | 'tint'>): string {
  const parts = [`Meditation on ${formatDay(session.startedAt)}`, tint, ...session.feelings]
  if (!session.completedAt) parts.push('ended early')
  return `${parts.join(', ')}.`
}
